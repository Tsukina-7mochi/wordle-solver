import { CHAR_STATE } from './const.ts';

const chars = 'abcdefghijklmnopqrstuvwxyz'.split('');

const check = function(input: string, answer: string): CHAR_STATE[] {
  // 文字の出現数
  const charCount = new Map<string, number>();
  chars.forEach((char) => charCount.set(char, 0));
  answer.split('').forEach((char) => {
    const count = charCount.get(char);
    if(typeof count !== 'number') {
      throw Error('The answer contains undefined character.');
    }

    charCount.set(char, count + 1);
  });

  const decreaseCharCount = function(char: string): void {
    const count = charCount.get(char);
    if(typeof count !== 'number') {
      throw Error('The input contains undefined character.');
    }
    charCount.set(char, count - 1);
  }
  const result: CHAR_STATE[] = new Array(input.length).fill(CHAR_STATE.NOT_CONTAINED);

  // 位置を含めて一致しているものを処理
  for(let i = 0; i < input.length; i++) {
    if(input[i] === answer[i]) {
      result[i] = CHAR_STATE.CORRECT;
      decreaseCharCount(input[i]);
    }
  }
  // 含まれるものを処理
  for(let i = 0; i < input.length; i++) {
    if(result[i] !== CHAR_STATE.CORRECT) {
      const count = charCount.get(input[i]);
      if(typeof count !== 'number') {
        throw Error('The input contains undefined character.');
      }
      if(count > 0) {
        decreaseCharCount(input[i]);
        result[i] = CHAR_STATE.CONTAINED;
      }
    }
  }

  return result;
}

export {
  check
}