const { ContainerClient } = require('@azure/storage-blob') // eslint-disable-line no-unused-vars
const { SearchClient } = require('@azure/search-documents') // eslint-disable-line no-unused-vars
const crypto = require('crypto')
const { chunkDocument } = require('../utils/chunker')
const { uploadDocument, deleteDocuments } = require('../services/azure-search-service')
const { generateEmbedding } = require('../services/openai-service')
const { getManifest, uploadManifest } = require('../services/blob-client')
const { logger } = require('../lib/logger')
const { generateShortSummary } = require('../services/openai-service')

/**
 * @typedef {{link: string, lastModified: string, documentKeys: string[]}} Manifest
 */

/**
 * Chunks and uploads grants to AI Search & removes old grants from AI Search
 * @param {{ grants: import('../services/govuk-api').Grant[], scheme: { manifestFile: string, schemeName: string }, containerClient: ContainerClient, searchClient: SearchClient, searchSummariesClient: SearchClient }} props
 * @returns {{number, processedGrants: Manifest[]}}
 */
const process = async ({ grants, scheme, containerClient, searchClient, searchSummariesClient }) => {
  const manifestGrants = await getManifest(scheme.manifestFile, containerClient)

  const removedGrants = manifestGrants.filter((manifestGrant) => isGrantRemoved(manifestGrant, grants))
  const removedGrantLinks = removedGrants.map((grant) => grant.link)
  const manifestData = manifestGrants.filter((grant) => !removedGrantLinks.includes(grant.link))
  await processRemovedGrants(removedGrants, searchClient, searchSummariesClient)

  const result = await processGrants({
    grants,
    manifestGrants: manifestData,
    schemeName: scheme.schemeName,
    containerClient,
    searchClient,
    searchSummariesClient
  })

  manifestData.push(...result.processedGrants)
  await uploadManifest(manifestData, scheme.manifestFile, containerClient)

  return result
}

/**
 * Chunks and uploads grants to AI Search
 * @param {{ grants: import('../services/govuk-api').Grant[], manifestGrants: Manifest[], schemeName: string, containerClient: ContainerClient, searchClient: SearchClient }} props
 * @returns {{ chunkCount: number, processedGrants: Manifest[] }}
 */
const processGrants = async ({ grants, manifestGrants, schemeName, containerClient, searchClient, searchSummariesClient, summaryTokenLimit = 100 }) => {
  const processedGrants = []
  let chunkCount = 0

  for (const [index, grant] of grants.entries()) {
    try {
      if (isGrantOutofDate(grant, manifestGrants)) {
        const sourceURL = grant.url.replace('/api/content', '')
        const grantHash = crypto.createHash('md5').update(grant.title).digest('hex')
        const keys = []
        logger.info(`Processing grant ${index + 1}/${grants.length}... ${sourceURL}`)

        const chunks = chunkDocument({
          document: grant.content,
          title: grant.title,
          grantSchemeName: schemeName,
          sourceUrl: sourceURL
        })

        for (const [index, chunk] of chunks.entries()) {
          logger.debug(`Processing chunk ${index + 1}/${chunks.length}...`)
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

        const shortSummary = await generateShortSummary(grant.content, summaryTokenLimit)

        const summariesChunks = chunkDocument({
          document: shortSummary,
          title: grant.title,
          grantSchemeName: schemeName,
          sourceUrl: sourceURL
        })

        const summariesKeys = []
        // given the summary is short, there should only be one chunk
        for (const [index, chunk] of summariesChunks.entries()) {
          logger.debug(`Processing summary chunk ${index + 1}/${summariesChunks.length}...`)
          const chunkHash = crypto.createHash('md5').update(chunk).digest('hex')
          const embedding = await generateEmbedding(chunk)

          const summaryChunk = {
            chunk_id: chunkHash,
            parent_id: grantHash,
            chunk,
            title: grant.title,
            grant_scheme_name: schemeName,
            source_url: sourceURL,
            content_vector: embedding
          }

          // Upload short summary
          const processedKeys = await uploadDocument(summaryChunk, searchSummariesClient)
          summariesKeys.push(...processedKeys)
        }

        processedGrants.push({
          link: grant.url,
          lastModified: grant.updateDate.toISOString(),
          documentKeys: keys,
          summariesKeys
        })
      }
    } catch (error) {
      logger.error(error, 'Error uploading grant')
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
 * @param {SearchClient} searchSummariesClient
 * @returns boolean
 */
const processRemovedGrants = async (removedGrants, searchClient, searchSummariesClient) => {
  if (removedGrants.length === 0) {
    return true
  }

  const keys = removedGrants.flatMap((removedGrant) => removedGrant.documentKeys)
  const summaryKeys = removedGrants.map((removedGrant) => removedGrant.summariesKeys)

  const result = await deleteDocuments(keys, searchClient)
  const summaryResult = await deleteDocuments(summaryKeys, searchSummariesClient)

  return result && summaryResult
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
  process
}
