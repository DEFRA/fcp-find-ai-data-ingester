const { SearchClient, AzureKeyCredential } = require('@azure/search-documents')
const config = require('../config')
const { logger } = require('../lib/logger')

/**
 * Upload document to Azure AI Search
 * @param {{ chunk_id: string, parent_id: string, chunk: string, title: string, grant_scheme_name: string, source_url: string, content_vector: number[] }} document
 * @param { SearchClient } searchClient
 * @returns { string[] }
 */
const uploadDocument = async (document, searchClient) => {
  const uploadResult = await searchClient.uploadDocuments([document])

  const uploadedKeys = uploadResult.results
    .filter((result) => result.succeeded)
    .map((result) => result.key)

  const failedKeys = uploadResult.results
    .filter((result) => !result.succeeded)
    .map((result) => result.key)

  if (failedKeys.length > 0) {
    logger.info('failed keys: ', failedKeys)
  }

  return uploadedKeys
}

/**
 * Delete documents from Azure AI Search
 * @param {string[]} keys
 * @param {SearchClient} searchClient
 * @returns boolean
 */
const deleteDocuments = async (keys, searchClient) => {
  const deletedRes = await searchClient.deleteDocuments(config.azureOpenAI.primaryKeyName, keys)
  const unsuccessfulDeletes = deletedRes.results.filter((result) => !result.succeeded)

  return unsuccessfulDeletes.length === 0
}

const getSearchClient = async () => {
  const searchClient = new SearchClient(
    config.azureOpenAI.searchUrl,
    config.azureOpenAI.indexName,
    new AzureKeyCredential(config.azureOpenAI.searchApiKey)
  )

  return searchClient
}

const getSearchSummariesClient = async () => {
  const searchClient = new SearchClient(
    config.azureOpenAI.searchUrl,
    config.azureOpenAI.summaryIndexName,
    new AzureKeyCredential(config.azureOpenAI.searchApiKey)
  )

  return searchClient
}

module.exports = {
  getSearchClient,
  getSearchSummariesClient,
  uploadDocument,
  deleteDocuments
}
