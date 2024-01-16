import { ParsedWord } from "./types";

export const domTextNodeRegExp = /\w+(\-\w+)?|[~`!@#$%^&*()_+-={}\[\]:";'<>?,./]/g;
export const boundaryWordRegExp = /^(\w+(\-\w+)?)|([~`!@#$%^&*()_+-={}\[\]:";'<>?,./])/;

export const findWordAt = (text: string, startPos: number): string|undefined => {
  const match = text.substring(startPos).trim().match(boundaryWordRegExp);
  return match?.[0]
}

export const findWords = (text: string): ParsedWord[] => {
  const words: ParsedWord[] = []

  let match: RegExpExecArray | null;
  while ((match = domTextNodeRegExp.exec(text)) !== null) {
    words.push({word: match[0], index: match.index})
  }

  return words;
}