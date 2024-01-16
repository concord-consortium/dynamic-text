// these two regexs should be kept in sync

// this is used by the component to split part text in the DOM in a loop
// it matches words, words with hyphens and individual punctuation marks
export const domTextNodeRegExp = /\w+(\-\w+)?|[~`!@#$%^&*()_+-={}\[\]:";'<>?,./]/g;

// this is used by the manager to find the next word or punctuation in the text
// based on a starting index into the trimmed text
export const boundaryWordRegExp = /^(\w+(\-\w+)?)|([~`!@#$%^&*()_+-={}\[\]:";'<>?,./])/;