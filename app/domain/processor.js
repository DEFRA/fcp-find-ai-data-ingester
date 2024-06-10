const { ContainerClient } = require('@azure/storage-blob') // eslint-disable-line no-unused-vars
const crypto = require('crypto')
const { uploadChunkToBlob, withTimeout } = require('../services/blob-client')
const { chunkDocument } = require('../utils/chunker')

/**
 * @typedef {{link: string, lastModified: string}} Manifest
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
  let chunkCount = 0
  const processedGrants = []

  for (const grant of grants) {
    const lastModifiedString = manifestGrants.find((manifest) => manifest.link === grant.url)?.lastModified
    const manifestDate = new Date(lastModifiedString)

    // if the grant's last updated date is newer than manifest, add in the grant
    // if this link is not present in the manifest, also add in the grant
    if (!lastModifiedString || grant.updateDate > manifestDate) {
      const sourceURL = grant.url.replace('/api/content', '')
      const hash = crypto.createHash('md5').update(grant.title).digest('hex')

      const chunks = chunkDocument({
        document: grant.content,
        title: grant.title,
        grantSchemeName: schemeName,
        sourceUrl: grant.url
      })

      for (const [index, chunk] of chunks.entries()) {
        const chunkTitle = `${hash}_${index + 1}.txt`

        await withTimeout(uploadChunkToBlob({
          chunkContent: chunk,
          sourceURL,
          title: grant.title,
          documentTitle: chunkTitle,
          grantSchemeName: schemeName,
          containerClient,
          count: chunkCount
        }), 3000)
        chunkCount++
      }

      processedGrants.push({
        link: grant.url,
        lastModified: grant.updateDate.toISOString()
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
