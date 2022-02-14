interface charNum {
  char: string,
  min: number,
  max: number
}

export interface clue {
  possibleChars: string[][],
  includedChars: charNum[]
}
