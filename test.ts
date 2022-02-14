import * as checker from './checker.ts';
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { CHAR_STATE } from './const.ts';
import { clue } from './types.ts';
import * as util from './util.ts';

const chars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'] as const;


// ====================
//   CHECKER TEST
// ====================

const testChecker = (input: string, answer: string, result: CHAR_STATE[]) => () => {
  assertEquals(checker.check(input, answer), result);
}
const CRT = CHAR_STATE.CORRECT
const CTD = CHAR_STATE.CONTAINED;
const NCT = CHAR_STATE.NOT_CONTAINED;

Deno.test('checker #1', testChecker('abcde', 'abcde', [CRT, CRT, CRT, CRT, CRT]));
Deno.test('checker #2', testChecker('xxxxx', 'abcde', [NCT, NCT, NCT, NCT, NCT]));
Deno.test('checker #3', testChecker('aaaab', 'xxxxa', [CTD, NCT, NCT, NCT, NCT]));
Deno.test('checker #4', testChecker('aaabb', 'xxxaa', [CTD, CTD, NCT, NCT, NCT]));
Deno.test('checker #5', testChecker('baaab', 'aaaab', [NCT, CRT, CRT, CRT, CRT]));

// ====================
//   UTIL TEST
//     combineClues
// ====================

const testCombineClues = (clue1: clue, clue2: clue, clue3: clue) => () => {
  assertEquals(util.combineClues(clue1, clue2), clue3);
}
Deno.test('util.combineClues #1', testCombineClues({
  possibleChars: [['b', 'c', 'd', 'e'], ['a', 'b', 'c', 'd', 'e'], ['a', 'b', 'c', 'd', 'e']],
  includedChars: []
}, {
  possibleChars: [['a', 'b', 'c'], ['a', 'b', 'c', 'd', 'e'], []],
  includedChars: []
}, {
  possibleChars: [['b', 'c'], ['a', 'b', 'c', 'd', 'e'], []],
  includedChars: []
}));
Deno.test('util.combineClues #2', testCombineClues({
  possibleChars: [['a', 'b', 'c'], ['a', 'b', 'c', 'd', 'e'], []],
  includedChars: []
}, {
  possibleChars: [['b', 'c', 'd', 'e'], ['a', 'b', 'c', 'd', 'e'], ['a', 'b', 'c', 'd', 'e']],
  includedChars: []
}, {
  possibleChars: [['b', 'c'], ['a', 'b', 'c', 'd', 'e'], []],
  includedChars: []
}));

Deno.test('util.combineClues #3', testCombineClues({
  possibleChars: [],
  includedChars: [
    { char: 'a', min: 1, max: 5 },
    { char: 'b', min: 1, max: 5 },
    { char: 'c', min: 1, max: 5 }
  ]
}, {
  possibleChars: [],
  includedChars: [
    { char: 'a', min: 1, max: 5 },
    { char: 'b', min: 1, max: 5 },
    { char: 'c', min: 1, max: 5 }
  ]
}, {
  possibleChars: [],
  includedChars: [
    { char: 'a', min: 1, max: 5 },
    { char: 'b', min: 1, max: 5 },
    { char: 'c', min: 1, max: 5 }
  ]
}));
Deno.test('util.combineClues #4', testCombineClues({
  possibleChars: [],
  includedChars: [
    { char: 'a', min: 1, max: 5 },
    { char: 'b', min: 2, max: 5 },
    { char: 'c', min: 1, max: 4 }
  ]
}, {
  possibleChars: [],
  includedChars: [
    { char: 'a', min: 2, max: 4 },
    { char: 'b', min: 1, max: 4 },
    { char: 'c', min: 2, max: 5 }
  ]
}, {
  possibleChars: [],
  includedChars: [
    { char: 'a', min: 2, max: 4 },
    { char: 'b', min: 2, max: 4 },
    { char: 'c', min: 2, max: 4 }
  ]
}));
Deno.test('util.combineClues #5', testCombineClues({
  possibleChars: [],
  includedChars: [
    { char: 'a', min: 1, max: 5 },
    { char: 'b', min: 1, max: 5 },
    { char: 'c', min: 1, max: 5 }
  ]
}, {
  possibleChars: [],
  includedChars: [
  ]
}, {
  possibleChars: [],
  includedChars: [
    { char: 'a', min: 1, max: 5 },
    { char: 'b', min: 1, max: 5 },
    { char: 'c', min: 1, max: 5 }
  ]
}));
Deno.test('util.combineClues #6', testCombineClues({
  possibleChars: [],
  includedChars: [
    { char: 'a', min: 1, max: 5 },
    { char: 'b', min: 1, max: 5 },
    { char: 'c', min: 1, max: 5 }
  ]
}, {
  possibleChars: [],
  includedChars: [
    { char: 'e', min: 1, max: 5 },
    { char: 'f', min: 1, max: 5 }
  ]
}, {
  possibleChars: [],
  includedChars: [
    { char: 'a', min: 1, max: 5 },
    { char: 'b', min: 1, max: 5 },
    { char: 'c', min: 1, max: 5 },
    { char: 'e', min: 1, max: 5 },
    { char: 'f', min: 1, max: 5 }
  ]
}));

// ==============================
//   UTIL TEST
//     convertResultIntoClue
// ==============================

const testConvertResultIntoClue = (input: string, result: CHAR_STATE[], clue: clue) => () => {
  assertEquals(util.convertResultIntoClue(input, result), clue);
}
const __charsExcludeCache = new Map<string, string[]>();
const charsExclude = (charsToExclude: string) => {
  return __charsExcludeCache.get(charsToExclude) || (() => {
    const list = chars.filter((ch) => !charsToExclude.split('').includes(ch));
    __charsExcludeCache.set(charsToExclude, list);
    return list;
  })();
};
Deno.test('util.convertResultIntoClue #1', testConvertResultIntoClue('abcde', [CRT, CRT, CRT, CRT, CRT], {
  possibleChars: [['a'], ['b'], ['c'], ['d'], ['e']],
  includedChars: [
    { char: 'a', min: 1, max: 5 },
    { char: 'b', min: 1, max: 5 },
    { char: 'c', min: 1, max: 5 },
    { char: 'd', min: 1, max: 5 },
    { char: 'e', min: 1, max: 5 }
  ]
}));
Deno.test('util.convertResultIntoClue #2', testConvertResultIntoClue('abcde', [CRT, CRT, CRT, CRT, NCT], {
  possibleChars: [['a'], ['b'], ['c'], ['d'], chars.filter((char) => char !== 'e')],
  includedChars: [
    { char: 'a', min: 1, max: 5 },
    { char: 'b', min: 1, max: 5 },
    { char: 'c', min: 1, max: 5 },
    { char: 'd', min: 1, max: 5 }
  ]
}));
Deno.test('util.convertResultIntoClue #3', testConvertResultIntoClue('abcda', [CRT, NCT, NCT, NCT, CTD], {
  possibleChars: [['a'], charsExclude('bcd'), charsExclude('bcd'), charsExclude('bcd'), charsExclude('bcd')],
  includedChars: [
    { char: 'a', min: 2, max: 5 },
  ]
}));
Deno.test('util.convertResultIntoClue #4', testConvertResultIntoClue('aabbb', [CRT, CTD, NCT, NCT, NCT], {
  possibleChars: [['a'], charsExclude('b'), charsExclude('b'), charsExclude('b'), charsExclude('b')],
  includedChars: [
    { char: 'a', min: 2, max: 5 },
  ]
}));
Deno.test('util.convertResultIntoClue #5', testConvertResultIntoClue('aaabb', [CRT, CTD, NCT, NCT, NCT], {
  possibleChars: [['a'], charsExclude('b'), charsExclude('b'), charsExclude('b'), charsExclude('b')],
  includedChars: [
    { char: 'a', min: 2, max: 2 },
  ]
}));