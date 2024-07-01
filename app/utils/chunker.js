const tiktoken = require('js-tiktoken')

/**
 * Chunk a long string into multipler smaller parts
 * @param {{document: string, title: string, grantSchemeName: string, sourceUrl: string, tokenLimit: number}} chunkProps
 * @returns string[]
 */
function chunkDocument ({ document, title, grantSchemeName, sourceUrl, tokenLimit = 512 }) {
  const encoding = tiktoken.encodingForModel('gpt-3.5-turbo-16k-0613')
  const chunks = []
  let tokens = encoding.encode(document, [], [])

  let chunkNumber = 1
  const baseIdentifier = `(Title: ${title} | Grant Scheme Name: ${grantSchemeName} | Source: ${sourceUrl} | Chunk Number: `

  while (tokens.length > 0) {
    const identifier = `${baseIdentifier}${chunkNumber})===`
    const identifierTokens = encoding.encode(identifier)
    const availableTokenLimit = tokenLimit - identifierTokens.length

    const chunk = tokens.slice(0, availableTokenLimit)
    let chunkText = encoding.decode(chunk)

    const lastSentenceEnd = Math.max(
      chunkText.lastIndexOf('.'),
      chunkText.lastIndexOf('\n')
    )

    if (lastSentenceEnd !== -1 && (tokens.length > availableTokenLimit)) {
      chunkText = chunkText.slice(0, lastSentenceEnd + 1)
    }

    const cleanedText = chunkText.replace(/\n/g, ' ').trim()

    if (cleanedText && !/^\s*$/.test(cleanedText)) {
      chunks.push(`${identifier}${cleanedText}`)
      chunkNumber++
    }

    // Move the start of the next chunk to the end of the last sentence
    const overlapStart = lastSentenceEnd + 1
    tokens = tokens.slice(overlapStart ? encoding.encode(chunkText.slice(0, overlapStart)).length : availableTokenLimit)
  }

  return chunks
}

module.exports = {
  chunkDocument
}
