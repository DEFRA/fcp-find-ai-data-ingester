const { OpenAIEmbeddings } = require('@langchain/openai')
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

module.exports = {
  generateEmbedding
}
