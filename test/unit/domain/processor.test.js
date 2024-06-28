const { process } = require('../../../app/domain/processor')
const OpenAiService = require('../../../app/services/openai-service')
const Chunker = require('../../../app/utils/chunker')
const BlobClient = require('../../../app/services/blob-client')

jest.mock('@azure/storage-blob')
jest.mock('../../../app/services/openai-service')
jest.mock('../../../app/utils/chunker')
jest.mock('../../../app/services/blob-client')

describe('processor', () => {
  let searchClientMock = jest.fn()

  beforeEach(() => {
    searchClientMock = {
      uploadDocuments: jest.fn(),
      deleteDocuments: jest.fn()
    }
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('process', () => {
    test('remove deleted grants', async () => {
      const grants = [
        {
          title: '',
          content: '',
          updateDate: new Date('2024-05-31T10:39:36.000Z'),
          url: 'http://existinggrant.test'
        }
      ]

      const manifestGrants = [
        {
          link: 'http://existinggrant.test',
          lastModified: '2024-05-31T10:39:36.000Z',
          documentKeys: [
            'keyOne',
            'keyTwo',
            'keyThree'
          ]
        },
        {
          link: 'http://oldgrant.test',
          lastModified: '',
          documentKeys: [
            'keyFour',
            'keyFive',
            'keySix'
          ]
        }
      ]

      searchClientMock.deleteDocuments.mockResolvedValue({
        results: [
          {
            key: 'keyFour',
            succeeded: true
          },
          {
            key: 'keyFive',
            succeeded: true
          },
          {
            key: 'keySix',
            succeeded: true
          }
        ]
      })

      BlobClient.getManifest.mockResolvedValue(manifestGrants)

      await process({
        grants,
        scheme: { manifestFile: 'testmanifest.json', schemeName: 'scheme name' },
        containerClient: {},
        searchClient: searchClientMock
      })

      expect(searchClientMock.deleteDocuments).toHaveBeenCalledWith('chunk_id', ['keyFour', 'keyFive', 'keySix'])
      expect(BlobClient.uploadManifest).toHaveBeenCalledWith(
        [{ documentKeys: ['keyOne', 'keyTwo', 'keyThree'], lastModified: '2024-05-31T10:39:36.000Z', link: 'http://existinggrant.test' }],
        'testmanifest.json',
        {}
      )
    })

    test('upload new grants', async () => {
      const grants = [
        {
          title: 'existingtitle',
          content: 'existingtest',
          updateDate: new Date('2024-05-31T10:39:36.000Z'),
          url: 'http://existinggrant.test'
        },
        {
          title: 'newtitle',
          content: 'newtest',
          updateDate: new Date('2024-05-31T10:39:36.000Z'),
          url: 'http://newgrant.test'
        }
      ]

      const manifestGrants = [
        {
          link: 'http://existinggrant.test',
          lastModified: '2024-05-31T10:39:36.000Z',
          documentKeys: [
            'keyOne',
            'keyTwo',
            'keyThree'
          ]
        }
      ]

      searchClientMock.uploadDocuments.mockResolvedValue({
        results: [
          {
            key: 'key',
            succeeded: true
          }
        ]
      })

      jest.spyOn(OpenAiService, 'generateEmbedding').mockResolvedValue([1.0, 1.0])
      jest.spyOn(Chunker, 'chunkDocument').mockReturnValue(['chunk1', 'chunk2'])

      BlobClient.getManifest.mockResolvedValue(manifestGrants)

      await process({
        grants,
        manifestGrants,
        scheme: { manifestFile: 'testmanifest.json', schemeName: 'scheme name' },
        containerClient: {},
        searchClient: searchClientMock
      })

      expect(searchClientMock.uploadDocuments).toHaveBeenCalledWith([
        expect.objectContaining({
          chunk: 'chunk1'
        })
      ])
      expect(BlobClient.uploadManifest).toHaveBeenCalledWith(
        [
          { documentKeys: ['keyOne', 'keyTwo', 'keyThree'], lastModified: '2024-05-31T10:39:36.000Z', link: 'http://existinggrant.test' },
          { documentKeys: ['key', 'key'], lastModified: '2024-05-31T10:39:36.000Z', link: 'http://newgrant.test' }
        ],
        'testmanifest.json',
        {}
      )
    })
  })
})
