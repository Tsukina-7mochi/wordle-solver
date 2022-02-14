import { clue } from './types.ts';
import { countCharInString, numInRange } from './util.ts';

const wordLength = 5;

const answers = Deno.readTextFileSync('./wordle-answers-alphabetical.txt').split('\n');
const guesses = Deno.readTextFileSync('./wordle-allowed-guesses.txt').split('\n');
const chars = 'abcdefghijklmnopqrstuvwxyz'.split('');

const guess = function(clue: clue): string {
  const possibleAnswers = answers.filter((ans) => {
    // 各位置の文字がpossibleCharsに含まれなければfalseを返す
    for(let i = 0; i < wordLength; i++) {
      if(!clue.possibleChars[i].includes(ans[i])) {
        return false;
      }
    }

    // includedCharsのすべての文字を規定の数含んでいなければfalseを返す
    if(!clue.includedChars.every((charInfo) => numInRange(charInfo.min, countCharInString(ans, charInfo.char), charInfo.max))) {
      return false;
    }

    return true;
  });

  console.log(`${possibleAnswers.length} possible answers`);

  return possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)];
}

export {
  guess
}