const { BlobServiceClient, ContainerClient } = require('@azure/storage-blob') // eslint-disable-line no-unused-vars
const config = require('../config')

async function getContainer () {
  const containerClient = await getContainerClient()

  return containerClient
}

/**
 * Upload manifest to azure blob storage
 * @param {import('../domain/processor').Manifest} manifestData
 * @param {string} manifestFilename
 * @param {ContainerClient} containerClient
 */
async function uploadManifest (manifestData, manifestFilename, containerClient) {
  const manifestText = JSON.stringify(manifestData, null, 2)

  const blobClient = containerClient.getBlockBlobClient(manifestFilename)

  try {
    await blobClient.upload(manifestText, manifestText.length, {
      overwrite: true
    })
    await blobClient.setMetadata({ dateUploaded: new Date().toISOString() })

    console.log(`Manifest uploaded successfully: ${manifestFilename}`)
  } catch (error) {
    console.error('Error uploading manifest blob:', error)
  }
}
/**
 * Get a list of grant links processed in previous runs
 * @param {string} manifestFilename
 * @returns {Promise<import('../domain/processor').Manifest[]>}
 */
async function getManifest (manifestFilename) {
  const containerClient = await getContainerClient()
  const manifestClient = containerClient.getBlockBlobClient(manifestFilename)

  try {
    const manifestStream = await manifestClient.download()
    const manifestText = await streamToBuffer(manifestStream.readableStreamBody)
    const manifestJSON = JSON.parse(manifestText)

    return manifestJSON
  } catch (error) {
    if (!error.statusCode || error.statusCode !== 404) {
      console.log('Error fetching Manifest: ', error)
    }

    return []
  }
}

async function streamToBuffer (readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = []
    readableStream.on('data', (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data))
    })
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks))
    })
    readableStream.on('error', reject)
  })
}

/**
 * Returns an instance of container client
 * @returns {ContainerClient}
 */
async function getContainerClient () {
  const blobServiceClient = BlobServiceClient.fromConnectionString(config.blobStorage.connectionString, {
    retryOptions: {
      maxTries: 3,
      tryTimeoutInMs: 1000,
      retryDelayInMs: 1000,
      maxRetryDelayInMs: 1000
    }
  })
  const containerClient = blobServiceClient.getContainerClient(config.blobStorage.containerName)

  return containerClient
}

module.exports = {
  uploadManifest,
  getManifest,
  getContainer
}
