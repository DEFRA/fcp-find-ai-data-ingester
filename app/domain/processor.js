const { OpenAIEmbeddings } = require('@langchain/openai')
const { ContainerClient } = require('@azure/storage-blob') // eslint-disable-line no-unused-vars
const crypto = require('crypto')
const { chunkDocument } = require('../utils/chunker')
const config = require('../config')
const { uploadDocument, getSearchClient } = require('../services/azure-search-service')

const onFailedAttempt = async (error) => {
  if (error.retriesLeft === 0) {
    throw new Error(`Failed to get embeddings: ${error}`)
  }
}

/**
 * @typedef {{link: string, lastModified: string, documentKeys: string[]}} Manifest
 */

/**
 * Chunks and uploads grants to azure blob storage
 * @param {{title: string, content: string, updateDate: Date, url: string}[]} grants
 * @param {Manifest[]} manifestGrants
 * @param {string} schemeName
 * @param {ContainerClient} containerClient
 * @returns {{number, processedGrants: Manifest[]}}
 */
const processGrants = async (grants, manifestGrants, schemeName, containerClient) => {
  const processedGrants = []
  const embeddings = new OpenAIEmbeddings({
    azureOpenAIApiInstanceName: config.azureOpenAI.openAiInstanceName,
    azureOpenAIApiKey: config.azureOpenAI.openAiKey,
    azureOpenAIApiDeploymentName: 'text-embedding-ada-002',
    azureOpenAIApiVersion: '2024-02-01',
    onFailedAttempt
  })
  let chunkCount = 0
  const azureSearchClient = await getSearchClient()

  for (const [index, grant] of grants.entries()) {
    const lastModifiedString = manifestGrants.find((manifest) => manifest.link === grant.url)?.lastModified
    const manifestDate = new Date(lastModifiedString)

    // if the grant's last updated date is newer than manifest, add in the grant
    // if this link is not present in the manifest, also add in the grant
    if (!lastModifiedString || grant.updateDate > manifestDate) {
      const sourceURL = grant.url.replace('/api/content', '')
      const grantHash = crypto.createHash('md5').update(grant.title).digest('hex')
      const keys = []
      console.log(`Processing grant ${index + 1}/${grants.length}... ${sourceURL}`)

      const chunks = chunkDocument({
        document: grant.content,
        title: grant.title,
        grantSchemeName: schemeName,
        sourceUrl: grant.url
      })

      for (const [index, chunk] of chunks.entries()) {
        console.log(`Processing chunk ${index + 1}/${chunks.length}...`)
        const chunkHash = crypto.createHash('md5').update(chunk).digest('hex')
        const embedding = await embeddings.embedDocuments([chunk])

        const documentChunk = {
          chunk_id: chunkHash,
          parent_id: grantHash,
          chunk,
          title: grant.title,
          grant_scheme_name: schemeName,
          source_url: sourceURL,
          content_vector: embedding[0]
        }

        const processedKeys = await uploadDocument(documentChunk, azureSearchClient)
        keys.push(...processedKeys)
        chunkCount++
      }

      processedGrants.push({
        link: grant.url,
        lastModified: grant.updateDate.toISOString(),
        documentKeys: keys
      })
    }
  }

  return {
    chunkCount,
    processedGrants
  }
}

module.exports = {
  processGrants
}
