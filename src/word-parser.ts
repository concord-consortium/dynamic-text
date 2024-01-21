import { ParsedWord } from "./types";

const wordRegExp = /(((?!_)\w+([-']\w+)?)|([#]))/; // note: the (?!_) is to remove underscores from word character matches
const numberRangeRegExp = /(\d+)\-/;

export const findWordAt = (text: string, startIndex: number): ParsedWord|undefined => {
  const match = wordRegExp.exec(text.substring(startIndex))
  if (match) {
    let word = match[1]
    // numbers are words and we want to return hyphenated words, like "re-test", but each number
    // in a number range like 1-100
    const numberMatch = word.match(numberRangeRegExp)
    if (numberMatch) {
      word = numberMatch[1]
    }
    return {word, index: startIndex + match.index}
  }
}

export const findWords = (text: string): ParsedWord[] => {
  const words: ParsedWord[] = []

  let index = 0;
  let word: ParsedWord|undefined
  do {
    word = findWordAt(text, index)

    if (word !== undefined) {
      words.push(word)
      index = word.index + word.word.length
    }
  } while (word !== undefined)

  return words;
}