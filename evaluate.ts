import { clue } from './types.ts';
import { check } from './checker.ts';
import { combineClues, convertResultIntoClue, wordMatchesToClue } from './util.ts';

const chars = 'abcdefghijklmnopqrstuvwxyz'.split('');

type evaluationFunc = ((
  word: string,
  possibleAnswers: Set<string>,
  possibleGuesses: Set<string>,
  answers: Set<string>,
  guesses: Set<string>,
  gameProgress: number,
  clue: clue,
) => number);

class Evaluator {
  possibleAnswers: Parameters<evaluationFunc>[1] = new Set();
  possibleGuesses: Parameters<evaluationFunc>[2] = new Set();
  readonly answers: Parameters<evaluationFunc>[3];
  readonly guesses: Parameters<evaluationFunc>[4];
  gameProgress: Parameters<evaluationFunc>[5] = 0;
  readonly eval: ((word: Parameters<evaluationFunc>[0]) => number);
  clue_: Parameters<evaluationFunc>[6] | null = null;

  /**
   * @param answers: 答えの語の集合
   * @param guesses: 推測として入力可能な語の集合
   * @param possibleAnswers: 答えとしてあり得る(手がかりによって成約された)語の集合
   * @param gameProgress: ゲームの進行度(0 <= progress < 1)
   * @param evaluationFunc: 評価関数
   */
  constructor(
    answers: Evaluator['answers'],
    guesses: Evaluator['guesses'],
    evaluationFunc: evaluationFunc
  ) {
    this.answers = answers;
    this.guesses = guesses;
    this.eval = (word: string): number => {
      if(this.clue_ === null) {
        throw Error('Clue is not set to evaluator.');
      }

      return evaluationFunc(
        word,
        this.possibleAnswers,
        this.possibleGuesses,
        this.answers,
        this.guesses,
        this.gameProgress,
        this.clue_
      );
    }
  }

  set clue(clue: clue) {
    this.possibleAnswers = new Set(Array.from(this.answers).filter((word) => wordMatchesToClue(word, clue)));
    this.possibleGuesses = new Set(Array.from(this.guesses).filter((word) => wordMatchesToClue(word, clue)));
    this.clue_ = clue;
  }
}

/** あり得る答えの分布において語の「妥当性」を
 * それぞれの文字の分布の中で現れる確率によって評価 */
const localAdequacy: evaluationFunc = (
  word: string,
  possibleAnswers: Set<string>,
  _1,
  _2,
  _3,
  _4,
  _5
): number => {
  // 文字ごとの分布を作成
  // [i]: (i+1)文字目の分布, Map<文字, その文字が含まれる数>
  const charDistribution = new Array(word.length).fill(0).map(_ => new Map<string, number>());
  for(const char of chars) {
    charDistribution.forEach((dist) => dist.set(char, 0));
  }
  const charDistributionGet = (index: number, key: string): number => {
    if(index < 0 || charDistribution.length <= index) {
      throw Error('Character distribution is not defined at given position: ' + index);
    }

    const val = charDistribution[index].get(key);
    if(typeof val !== 'number') {
      throw Error(`The character is not contained in distribution[${index}]: ${key}`);
    }

    return val;
  }

  for(const ans of possibleAnswers) {
    for(let i = 0; i < ans.length; i++) {
      charDistribution[i].set(ans[i], charDistributionGet(i, ans[i]) + 1);
    }
  }

  // wordの各文字がそれぞれの分布の中で現れる確率の線形和によって評価
  return charDistribution.reduce((partialSum, _, i) => partialSum + charDistributionGet(i, word[i]), 0) / (possibleAnswers.size * 5);
}

/** あり得る答えの分布において語の「妥当性」を
 * すべての位置の文字の分布の中で現れる確率によって評価 */
const globalAdequacy: evaluationFunc = (
  word: string,
  possibleAnswers: Set<string>,
  _1,
  _2,
  _3,
  _4,
  _5
): number => {
  // 文字ごとの分布を作成
  // [i]: (i+1)文字目の分布, Map<文字, その文字がn個含まれる語の数を並べたリスト>
  const charDistribution = new Map<string, number[]>();
  for(const char of chars) {
    charDistribution.set(char, new Array(word.length).fill(0));
  }
  const charDistributionGet = (key: string): number[] => {
    const val = charDistribution.get(key);
    if(typeof val === 'undefined') {
      throw Error(`The character is not contained in distribution: ${key}`);
    }

    return val;
  }

  for(const ans of possibleAnswers) {
    // 文字が出てきた数を記録するMap
    const charAppearances = new Map<string, number>();
    for(let i = 0; i < ans.length; i++) {
      const char = ans[i];
      const currentAppearances = charAppearances.get(char) || 0;
      charAppearances.set(char, currentAppearances + 1);

      charDistributionGet(char)[currentAppearances] += 1;
    }
  }

  // wordの各文字がそれぞれの分布の中で現れる確率の線形和によって評価
  let score = 0;
  // 文字が出てきた数を記録するMap
  const charAppearances = new Map<string, number>();
  for(let i = 0; i < word.length; i++) {
    const char = word[i];
    const currentAppearances = charAppearances.get(char) || 0;
    charAppearances.set(char, currentAppearances + 1);

    score += charDistributionGet(char)[currentAppearances + 1];
  }

  // 大きさを1に正規化
  return score / (possibleAnswers.size * 5);
}

/** 次の候補の数の期待値が少ないほうが点数が大きくなる */
const fewestNextCandidate: evaluationFunc = (
  word: string,
  possibleAnswers: Set<string>,
  possibleGuesses: Set<string>,
  _1,
  _2,
  _3,
  clue: clue,
): number => {
  if(possibleAnswers.size === 0) {
    return 0;
  }

  // 評価結果(CHAR_STATE[])に対応する次のあり得る答えの数をキャッシュ
  const cachedNextCandidate = new Map<string, number>();
  const resultToStr = (result: ReturnType<typeof check>) => result.join('');

  let expectedNextCandidate = 0;
  for(const answer of possibleAnswers) {
    // 答えがanswerであるときを仮定
    const result = check(word, answer);
    const resultStr = resultToStr(result);
    const cachedCandidate = cachedNextCandidate.get(resultStr);

    if(typeof cachedCandidate === 'number') {
      // キャッシュされた値を使用
      expectedNextCandidate += cachedCandidate;
    } else {
      const nextClue = combineClues(clue, convertResultIntoClue(word, result));

      // 次の候補の数を数える
      let nextCandidate = 0;
      for(const g of possibleGuesses) {
        if(wordMatchesToClue(g, nextClue)) {
          nextCandidate += 1;
        }
      }
      cachedNextCandidate.set(resultStr, nextCandidate);
      expectedNextCandidate += nextCandidate;
    }
  }

  // 答えがansである確率はそれぞれ 1 / possibleAnswers.size
  expectedNextCandidate /= possibleAnswers.size;

  // 大きさを1に正規化し、候補数が少ないほど1に近い値を返すようにする
  return 1 - (expectedNextCandidate / possibleAnswers.size);
}

export default Evaluator;
export const evaluationFunc = {
  localAdequacy,
  globalAdequacy,
  fewestNextCandidate
};