const tiktoken = require('js-tiktoken')

/**
 * Chunk a long string into multiple smaller parts and generate a short description for the whole document
 * @param {{document: string, title: string, grantSchemeName: string, sourceUrl: string, tokenLimit: number, summaryTokenLimit: number}} chunkProps
 * @returns {{chunks: string[], shortSummary: string}} Array of chunks and short summary
 */
function chunkDocument ({ document, title, grantSchemeName, sourceUrl, tokenLimit = 512, summaryTokenLimit = 60 }) {
  const encoding = tiktoken.encodingForModel('gpt-3.5-turbo-16k-0613')
  const chunks = []
  let tokens = encoding.encode(document, [], [])

  // Generate short summary for the whole document
  const summaryTokens = tokens.slice(0, summaryTokenLimit)
  let shortSummary = encoding.decode(summaryTokens)
  const lastSummarySentenceEnd = Math.max(
    shortSummary.lastIndexOf('.'),
    shortSummary.lastIndexOf('\n')
  )
  if (lastSummarySentenceEnd !== -1) {
    shortSummary = shortSummary.slice(0, lastSummarySentenceEnd + 1)
  }

  shortSummary = shortSummary.replace(/\n/g, ' ').trim()

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

  return {
    chunks,
    shortSummary
  }
}

module.exports = {
  chunkDocument
}
