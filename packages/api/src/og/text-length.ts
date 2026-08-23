export const truncationSuffix = '...'

const doubleLengthCharacterPattern = /[\p{Script=Han}\u3000-\u303f\uff00-\uffef]/u

const characterLength = (value: string) =>
  doubleLengthCharacterPattern.test(value) ? 2 : 1

export const textLength = (value: string) =>
  Array.from(value).reduce(
    (length, character) => length + characterLength(character),
    0,
  )

const truncationSuffixLength = textLength(truncationSuffix)

export const minTruncationLength = truncationSuffixLength + 1

const isAsciiWordCharacter = (value: string) => /[A-Za-z0-9'-]/.test(value)
const unbreakableAsciiRunPattern = /[A-Za-z0-9_'-]+/g

const isSplitAsciiWord = (value: string, nextCharacter: string) => {
  const previousCharacter = Array.from(value).at(-1)
  if (!previousCharacter) return false
  return (
    isAsciiWordCharacter(previousCharacter) && isAsciiWordCharacter(nextCharacter)
  )
}

const charactersWithinLength = (
  characters: readonly string[],
  maxLength: number,
) => {
  const visibleCharacters: string[] = []
  let length = 0

  for (const character of characters) {
    const nextLength = length + characterLength(character)
    if (nextLength > maxLength) break
    visibleCharacters.push(character)
    length = nextLength
  }

  return visibleCharacters
}

export const truncateText = (value: string, maxLength: number) => {
  const characters = Array.from(value)
  if (textLength(value) <= maxLength) return value

  const contentLength = maxLength - truncationSuffixLength
  if (contentLength <= 0) return truncationSuffix.slice(0, maxLength)

  const visibleCharacters = charactersWithinLength(characters, contentLength)
  const visibleText = visibleCharacters.join('').trimEnd()
  const nextCharacter = characters.at(visibleCharacters.length) ?? ''
  if (!isSplitAsciiWord(visibleText, nextCharacter))
    return `${visibleText}${truncationSuffix}`

  const wordBoundaryIndex = visibleText.search(/\s+\S*$/)
  if (wordBoundaryIndex <= 0) return `${visibleText}${truncationSuffix}`

  const wordSafeText = visibleText.slice(0, wordBoundaryIndex).trimEnd()
  if (wordSafeText.length === 0) return `${visibleText}${truncationSuffix}`
  return `${wordSafeText}${truncationSuffix}`
}

export const truncateUnbreakableTextRuns = (value: string, maxRunLength: number) =>
  value.replace(unbreakableAsciiRunPattern, run => truncateText(run, maxRunLength))
