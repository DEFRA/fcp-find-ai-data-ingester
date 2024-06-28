const { ContainerClient } = require('@azure/storage-blob') // eslint-disable-line no-unused-vars
const crypto = require('crypto')
const { chunkDocument } = require('../utils/chunker')
const { uploadDocument, deleteDocuments } = require('../services/azure-search-service')
const { SearchClient } = require('@azure/search-documents') // eslint-disable-line no-unused-vars
const { generateEmbedding } = require('../services/openai-service')

/**
 * @typedef {{link: string, lastModified: string, documentKeys: string[]}} Manifest
 */

/**
 * Chunks and uploads grants to AI Search & removes old grants from AI Search
 * @param {import('../services/govuk-api').Grant[]} grants
 * @param {Manifest[]} manifestGrants
 * @param {string} schemeName
 * @param {ContainerClient} containerClient
 * @param {SearchClient} searchClient
 * @returns {{number, processedGrants: Manifest[]}}
 */
const process = async (grants, manifestGrants, schemeName, containerClient, searchClient) => {
  const removedGrants = manifestGrants.filter((manifestGrant) => isGrantRemoved(manifestGrant, grants))

  await processRemovedGrants(removedGrants, searchClient)

  await processGrants(grants, manifestGrants, schemeName, containerClient, searchClient)
}

/**
 * Chunks and uploads grants to AI Search
 * @param {import('../services/govuk-api').Grant[]} grants
 * @param {Manifest[]} manifestGrants
 * @param {string} schemeName
 * @param {ContainerClient} containerClient
 * @param {SearchClient} searchClient
 * @returns {{number, processedGrants: Manifest[]}}
 */
const processGrants = async (grants, manifestGrants, schemeName, containerClient, searchClient) => {
  const processedGrants = []

  let chunkCount = 0

  for (const [index, grant] of grants.entries()) {
    if (isGrantOutofDate(grant, manifestGrants)) {
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
        const embedding = await generateEmbedding(chunk)

        const documentChunk = {
          chunk_id: chunkHash,
          parent_id: grantHash,
          chunk,
          title: grant.title,
          grant_scheme_name: schemeName,
          source_url: sourceURL,
          content_vector: embedding
        }

        const processedKeys = await uploadDocument(documentChunk, searchClient)
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

/**
 * Removes out of date grant documents from AI search
 * @param {Manifest[]} removedGrants
 * @param {SearchClient} searchClient
 * @returns boolean
 */
const processRemovedGrants = async (removedGrants, searchClient) => {
  if (removedGrants.length === 0) {
    return true
  }

  const keys = removedGrants.flatMap((removedGrant) => removedGrant.documentKeys)

  const result = await deleteDocuments(keys, searchClient)

  return result
}

/**
 * Returns true if grant s
 * @param {Manifest} manifestGrant
 * @param {import('../services/govuk-api').Grant[]} grants
 * @returns boolean
 */
const isGrantRemoved = (manifestGrant, grants) => {
  const matchedGrants = grants.filter((grant) => grant.url === manifestGrant.link)

  return matchedGrants.length === 0
}

/**
 * Returns true if a live grant's update date is newer than the manifest's update date
 * @param {import('../services/govuk-api').Grant} grant
 * @param {Manifest[]} manifestGrants
 * @returns boolean
 */
const isGrantOutofDate = (grant, manifestGrants) => {
  // if the grant's last updated date is newer than manifest, add in the grant
  // if this link is not present in the manifest, also add in the grant
  const lastModifiedString = manifestGrants.find((manifest) => manifest.link === grant.url)?.lastModified
  const manifestDate = new Date(lastModifiedString)

  return !lastModifiedString || grant.updateDate > manifestDate
}

module.exports = {
  processGrants,
  process
}
