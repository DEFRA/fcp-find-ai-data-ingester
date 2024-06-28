const { SearchClient, AzureKeyCredential } = require('@azure/search-documents')
const config = require('../config')

/**
 *
 * @param {{ chunk_id: string, parent_id: string, chunk: string, title: string, grant_scheme_name: string, source_url: string, content_vector: number[] }} document
 * @param {SearchClient} searchClient
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
    console.log('failed keys: ', failedKeys)
  }

  return uploadedKeys
}

const getSearchClient = async () => {
  const searchClient = new SearchClient(
    config.azureOpenAI.searchUrl,
    config.azureOpenAI.indexName,
    new AzureKeyCredential(config.azureOpenAI.searchApiKey)
  )

  return searchClient
}

module.exports = {
  getSearchClient,
  uploadDocument
}
