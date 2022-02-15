import { clue } from './types.ts';

const chars = 'abcdefghijklmnopqrstuvwxyz'.split('');

type evaluationFunc = ((
  word: string,
  possibleAnswers: Set<string>,
  answers: Set<string>,
  guesses: Set<string>,
  gameProgress: number,
  clue: clue,
) => number);

class Evaluator {
  possibleAnswers: Parameters<evaluationFunc>[1];
  readonly answers: Parameters<evaluationFunc>[2];
  readonly guesses: Parameters<evaluationFunc>[3];
  gameProgress: Parameters<evaluationFunc>[4];
  readonly eval: ((word: Parameters<evaluationFunc>[0], clue: Parameters<evaluationFunc>[5]) => number);

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
    possibleAnswers: Evaluator['possibleAnswers'],
    gameProgress: Evaluator['gameProgress'],
    evaluationFunc: evaluationFunc
  ) {
    this.answers = answers;
    this.guesses = guesses;
    this.possibleAnswers = possibleAnswers;
    this.gameProgress = gameProgress;
    this.eval = (word: string, clue: clue) => evaluationFunc(
      word,
      this.possibleAnswers,
      this.answers,
      this.guesses,
      this.gameProgress,
      clue
    );
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
  _4
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
  _4
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

export default Evaluator;
export const evaluationFunc = {
  localAdequacy,
  globalAdequacy
};