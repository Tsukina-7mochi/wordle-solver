const CHAR_STATE = {
  CORRECT: 0,
  CONTAINED: 1,
  NOT_CONTAINED: 2
} as const;
type CHAR_STATE = typeof CHAR_STATE[keyof typeof CHAR_STATE];

export {
  CHAR_STATE
}