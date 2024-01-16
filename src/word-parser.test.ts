import { findWordAt, findWords } from "./word-parser"

const emptyStrings = ["", "  ", "\n\n\n  \n"]
const singleWord = [
  "test",
  "  test", "test  ", "  test  ",
  "\ttest", "test\t", "\ttest\t",
  "\ntest", "test\n", "\ntest\n",
]
const simpleSentence = "This is a simple sentence."
const hyphenatedSentence = "This is a hyphenated-sentence."
const numberRangeSentence = "This is a range: 1-100."

describe("word-parser", () => {
  describe("findWordAt", () => {
    it("works on an empty string", () => {
      for (const text of emptyStrings) {
        expect(findWordAt(text, 0)).toBeUndefined()
      }
    })

    it("works for a single word", () => {
      for (const text of singleWord) {
        expect(findWordAt(text, 0)?.word).toBe("test")
      }
    })

    it("works for a simple sentence", () => {
      const text = simpleSentence
      expect(findWordAt(text, 0)?.word).toBe("This")
      expect(findWordAt(text, "This".length)?.word).toBe("is")
      expect(findWordAt(text, "This is".length)?.word).toBe("a")
      expect(findWordAt(text, "This is a".length)?.word).toBe("simple")
      expect(findWordAt(text, "This is a simple".length)?.word).toBe("sentence")
    })

    it("works for a hyphenated sentence", () => {
      const text = hyphenatedSentence
      expect(findWordAt(text, "This is a".length)?.word).toBe("hyphenated-sentence")
    })

    it("works for a number range sentence", () => {
      const text = numberRangeSentence
      expect(findWordAt(text, "This is a range: ".length)?.word).toBe("1")
    })
  })

  describe("findWords", () => {
    it("works on an empty string", () => {
      for (const text of emptyStrings) {
        expect(findWords(text)).toEqual([])
      }
    })


    it("works for a single word", () => {
      for (const text of singleWord) {
        expect(findWords(text).length).toBe(1)
        expect(findWords(text)[0].word).toBe("test")
      }
    })

    it("works for a hyphenated sentence", () => {
      const text = hyphenatedSentence
      expect(findWords(text).map(w => w.word)).toEqual([
        "This",
        "is",
        "a",
        "hyphenated-sentence",
      ])
    })

    it("works for a number range sentence", () => {
      const text = numberRangeSentence
      expect(findWords(text).map(w => w.word)).toEqual([
        "This",
        "is",
        "a",
        "range",
        "1",
        "100"
      ])
    })

    it("works for a complex sentence with all the punctuation", () => {
      const text = `Start "#1-100"(.) \`~!@$%^&*-_+=:;"'?,/ (it's) [the] {<end>}.`
      expect(findWords(text).map(w => w.word)).toEqual([
        "Start",
        "#",
        "1",
        "100",
        "it's",
        "the",
        "end",
      ])
    })
  })
})