import { clue } from './types.ts';
import { countCharInString, numInRange } from './util.ts';
import Evaluator, { evaluationFunc } from './evaluate.ts';

const wordLength = 5;

const answers = new Set(Deno.readTextFileSync('./wordle-answers-alphabetical.txt').split('\n'));
const guesses = new Set(Deno.readTextFileSync('./wordle-allowed-guesses.txt').split('\n'));
const evaluator = new Evaluator(answers, guesses, answers, 0, (
  word: string,
  possibleAnswers: Set<string>,
  answers: Set<string>,
  guesses: Set<string>,
  gameProgress: number,
  clue: clue,
) => evaluationFunc.globalAdequacy(word, possibleAnswers, answers, guesses, gameProgress, clue)
   + evaluationFunc.localAdequacy(word, possibleAnswers, answers, guesses, gameProgress, clue) * 0.1);

// 語が手がかりの成約を満たしていればtrue
const wordMatchesToClue = (word: string, clue: clue): boolean => {
  // 各位置の文字がpossibleCharsに含まれなければfalseを返す
  for(let i = 0; i < wordLength; i++) {
    if(!clue.possibleChars[i].includes(word[i])) {
      return false;
    }
  }

  // includedCharsのすべての文字を規定の数含んでいなければfalseを返す
  if(!clue.includedChars.every((charInfo) => numInRange(charInfo.min, countCharInString(word, charInfo.char), charInfo.max))) {
    return false;
  }

  return true;
}

const guess = function(clue: clue, gameProgress: number): string {
  const possibleAnswers = Array.from(answers).filter((ans) => wordMatchesToClue(ans, clue));

  evaluator.possibleAnswers = new Set(possibleAnswers);
  evaluator.gameProgress = gameProgress;

  console.log(`${possibleAnswers.length} possible answers`);

  const scores = possibleAnswers.map((candidate) => ({ word: candidate, score: evaluator.eval(candidate, clue) }));
  scores.sort((a, b) => b.score - a.score);

  console.log(`Top ${Math.min(5, scores.length)} candidates`);
  for(let i = 0; i < Math.min(5, scores.length); i++) {
    console.log(`${scores[i].word} (${scores[i].score})`);
  }

  return scores[0].word;
}

export {
  guess
}