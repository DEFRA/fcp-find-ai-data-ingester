const { uploadManifest } = require('../../../app/services/blob-client')

jest.mock('@azure/storage-blob')

describe('blob-client', () => {
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
