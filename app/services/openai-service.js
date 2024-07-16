const { OpenAIEmbeddings, ChatOpenAI } = require('@langchain/openai')
const { FakeChatModel } = require('@langchain/core/utils/testing')

const config = require('../config')

const onFailedAttempt = async (error) => {
  if (error.retriesLeft === 0) {
    throw new Error(`Failed to get embeddings: ${error}`)
  }
}

/**
 * Generates vector embeddings for content
 * @param {string} chunk
 * @returns {number[]}
 */
const generateEmbedding = async (chunk) => {
  const embeddings = new OpenAIEmbeddings({
    azureOpenAIApiInstanceName: config.azureOpenAI.openAiInstanceName,
    azureOpenAIApiKey: config.azureOpenAI.openAiKey,
    azureOpenAIApiDeploymentName: 'text-embedding-ada-002',
    azureOpenAIApiVersion: '2024-02-01',
    onFailedAttempt
  })

  const embedding = await embeddings.embedDocuments([chunk])

  return embedding[0]
}

/**
 * Generates a short summary for a given text
 * @param {string} text - The text to summarize
 * @param {number} summaryTokenLimit - The token limit for the summary
 * @returns {string} - The generated summary
 */
const generateShortSummary = async (text, summaryTokenLimit = 60, useFakeModel) => {
  const model = useFakeModel
    ? new FakeChatModel({ onFailedAttempt })
    : new ChatOpenAI({
      azureOpenAIApiInstanceName: config.azureOpenAI.openAiInstanceName,
      azureOpenAIApiKey: config.azureOpenAI.openAiKey,
      azureOpenAIApiDeploymentName: 'gpt-35-turbo-16k',
      azureOpenAIApiVersion: '2024-02-01',
      onFailedAttempt
    })

  const messages = [
    ['user', `
      Generate a summary of the following text without explaining that this is a summary. The result should be in the same tone and style as the original text. Limit the summary to ${summaryTokenLimit} tokens:
      ${text}
    `]
  ]

  try {
    const response = await model.generate(messages)

    return response.generations.flat()[0].text.replace(/\n/g, ' ').trim()
  } catch (error) {
    try {
      console.warn('Error generating summary using openai:', error)
      if (typeof document !== 'string') {
        console.error('Document is not a string', document)
        return ''
      }

      const summary = document.split(' ').slice(0, summaryTokenLimit).join(' ')
      const lastSentenceEnd = Math.max(
        summary.lastIndexOf('.'),
        summary.lastIndexOf('\n')
      )

      return summary.slice(0, lastSentenceEnd + 1)
    } catch (error) {
      console.error('Error generating summary using fallback:', error)
      return ''
    }
  }
}

module.exports = {
  generateEmbedding,
  generateShortSummary
}
