// @deno-types="https://deno.land/x/chalk_deno@v4.1.1-deno/index.d.ts";
import chalk from "https://deno.land/x/chalk_deno@v4.1.1-deno/source/index.js";
import { clue } from './types.ts';
import { guess } from './solver.ts';
import { check } from './checker.ts';
import { CHAR_STATE } from './const.ts';
import { combineClues, convertResultIntoClue } from './util.ts';

const answers = Deno.readTextFileSync('./wordle-answers-alphabetical.txt').split('\n');
const guesses = Deno.readTextFileSync('./wordle-allowed-guesses.txt').split('\n');
const chars = 'abcdefghijklmnopqrstuvwxyz'.split('');



// const answer = answers[Math.floor(Math.random() * answers.length)];
const answer = 'caulk';
console.log('answers: ', answers.length);
console.log('allowed guesses: ', guesses.length);
console.log(`set answer to ${chalk.bgGreen.whiteBright(answer.toUpperCase())}`);

const maxGuessNum = 6;
let clue: clue = {
  possibleChars: [[...chars], [...chars], [...chars], [...chars], [...chars]],
  includedChars: []
}
for(let guessNum = 1; guessNum <= maxGuessNum; guessNum += 1) {
  console.log(`Guess #${guessNum}`);

  console.log(`  1: ${clue.possibleChars[0].sort().join('')}`);
  console.log(`  2: ${clue.possibleChars[1].sort().join('')}`);
  console.log(`  3: ${clue.possibleChars[2].sort().join('')}`);
  console.log(`  4: ${clue.possibleChars[3].sort().join('')}`);
  console.log(`  5: ${clue.possibleChars[4].sort().join('')}`);
  console.log(`  included:`, clue.includedChars.map((charInfo) => `${charInfo.char}: [${charInfo.min}, ${charInfo.max}]`));

  // 次に入力する単語を決定
  const guessedWord = guess(clue, (guessNum - 1) / maxGuessNum);
  if(typeof guessedWord !== 'string') {
    // 候補がない場合undefinedを返す
    console.log('Cannot select next input.');
    break;
  }
  console.log(`guessed word: ${guessedWord}`);

  // 入力してチェック
  const checkResult = check(guessedWord, answer);
  let resultConsoleOutput = '';
  for(let i = 0; i < guessedWord.length; i++) {
    if(checkResult[i] === CHAR_STATE.CORRECT) {
      resultConsoleOutput += chalk.bgGreen.whiteBright(guessedWord[i].toUpperCase());
    } else if(checkResult[i] === CHAR_STATE.CONTAINED) {
      resultConsoleOutput += chalk.bgYellow.whiteBright(guessedWord[i].toUpperCase());
    } else {
      resultConsoleOutput += chalk.bgGray.whiteBright(guessedWord[i].toUpperCase());
    }
  }
  console.log(resultConsoleOutput);

  if(checkResult.every((v) => v === CHAR_STATE.CORRECT)) {
    console.log(`Got the answer in ${guessNum} guesses.`);
    break;
  }

  // 手がかりをアップデート
  clue = combineClues(clue, convertResultIntoClue(guessedWord, checkResult));
}