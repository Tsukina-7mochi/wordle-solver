import { clue } from './types.ts';
import { CHAR_STATE } from './const.ts';

const chars = 'abcdefghijklmnopqrstuvwxyz'.split('');

/** 文字列中に含まれる文字の数を数える */
const countCharInString = function(str: string, char: string): number {
  let count = 0;

  for(let i = 0; i < str.length; i++) {
    if(str[i] === char) {
      count += 1;
    }
  }

  return count;
}

/** bがa以上c以下であればtrueを返す */
const numInRange = (a: number, b: number, c: number): boolean => (a <= b && b <= c);

const arrayIntersect = function<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter((v) => arr2.includes(v));
}

/** 2つの手がかりを合成する(成約の共通部分を求める) */
const combineClues = function(clue1: clue, clue2: clue): clue {
  if(clue1.possibleChars.length !== clue2.possibleChars.length) {
    throw Error('Cannot combine clues of different word in length.');
  }
  const combinedPossibleChars = clue1.possibleChars.map((arr, i) => arrayIntersect(arr, clue2.possibleChars[i]));
  const combinedIncludedChars: (typeof clue1.includedChars) = [];

  clue1.includedChars.forEach((charInfo) => {
    combinedIncludedChars.push({ ...charInfo });
  });
  clue2.includedChars.forEach((charInfo) => {
    // charInfoと同じ文字に関する情報がある場合、
    // 成約の厳しい方に変更する
    for(const combiningInfo of combinedIncludedChars) {
      if(combiningInfo.char === charInfo.char) {
        // 同じ文字に関する情報がすでに存在する
        if(combiningInfo.min < charInfo.min) {
          combiningInfo.min = charInfo.min;
        }
        if(combiningInfo.max > charInfo.max) {
          combiningInfo.max = charInfo.max;
        }

        // forEachを抜ける
        return;
      }
    }

    combinedIncludedChars.push({ ...charInfo });
  });


  return {
    possibleChars: combinedPossibleChars,
    includedChars: combinedIncludedChars
  }
}

/** 入力の結果を手がかりに変換する */
const convertResultIntoClue = function(input: string, result: CHAR_STATE[]): clue {
  const inputCharArr = input.split('');

  const excludedChars = new Set(inputCharArr.filter((_, i) => (result[i] === CHAR_STATE.NOT_CONTAINED)));
  inputCharArr.forEach((_, i) => {
    if(result[i] !== CHAR_STATE.NOT_CONTAINED) {
      excludedChars.delete(input[i]);
    }
  });

  const includedChars_ = new Set(inputCharArr.filter((_, i) => (result[i] === CHAR_STATE.CONTAINED || result[i] === CHAR_STATE.CORRECT)));
  const includedChars = Array.from(includedChars_)
    .map((char) => {
      // note: ある文字が複数含まれているとき、含まれている数の分だけ黄色になる
      //       それ以上はグレーになる

      // 黄色(含まれていることを意味)のcharの数
      const containedCount = inputCharArr.filter((ch, i) => ch === char && (result[i] === CHAR_STATE.CONTAINED || result[i] === CHAR_STATE.CORRECT)).length;
      // グレー(含まれていないことを意味)のcharがあるか
      const hasNotContained = inputCharArr.some((ch, i) => ch === char && result[i] === CHAR_STATE.NOT_CONTAINED);
      return {
        char,
        min: containedCount,
        max: (hasNotContained ? containedCount : input.length)
      }
    });

  const possibleChars = inputCharArr.map((char, i) => {
    if(result[i] === CHAR_STATE.CORRECT) {
      return [char];
    } else {
      return chars.filter((ch) => !excludedChars.has(ch));
    }
  });

  return {
    possibleChars,
    includedChars
  }
}

const wordMatchesToClue = (word: string, clue: clue): boolean => {
  // 各位置の文字がpossibleCharsに含まれなければfalseを返す
  for(let i = 0; i < word.length; i++) {
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

export {
  countCharInString,
  numInRange,
  combineClues,
  convertResultIntoClue,
  wordMatchesToClue
}