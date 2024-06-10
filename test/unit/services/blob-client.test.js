const { uploadChunkToBlob, uploadManifest } = require('../../../app/services/blob-client')

jest.mock('@azure/storage-blob')

describe('blob-client', () => {
  describe('uploadChunkToBlob', () => {
    test('upload chunk to azure blob storage with the metadata', async () => {
      const content = 'chunk'
      const upload = jest.fn()

      const containerClient = {
        getBlockBlobClient: jest.fn().mockReturnValue({
          upload
        })
      }

      await uploadChunkToBlob({
        chunkContent: content,
        sourceURL: 'https://gov.uk/',
        title: 'grant',
        documentTitle: 'grant.txt',
        grantSchemeName: 'scheme',
        containerClient
      })

      expect(upload).toHaveBeenCalledWith(content, content.length, {
        metadata: {
          document_title: 'grant.txt',
          grant_scheme_name: 'scheme',
          source_url: 'https://gov.uk/'
        },
        overwrite: true
      })
    })
  })

  describe('uploadManifest', () => {
    test('upload manifest to azure blob storage', async () => {
      const manifestData = [
        {
          link: 'htts://gov.uk/',
          lastModified: '2024-05-31T10:39:36.000Z'
        }
      ]
      const expectedManifestData = JSON.stringify(manifestData, null, 2)
      const upload = jest.fn()
      const setMetadata = jest.fn()

      const containerClient = {
        getBlockBlobClient: jest.fn().mockReturnValue({
          upload,
          setMetadata
        })
      }

      await uploadManifest(manifestData, 'manifest.json', containerClient)

      expect(upload).toHaveBeenCalledWith(expectedManifestData, expectedManifestData.length, {
        overwrite: true
      })
    })
  })
})
