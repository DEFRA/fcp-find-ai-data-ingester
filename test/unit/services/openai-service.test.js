const { generateShortSummary } = require('../../../app/services/openai-service')

jest.mock('@azure/storage-blob')
jest.mock('../../../app/utils/chunker')
jest.mock('../../../app/services/blob-client')

jest.mock('@langchain/openai', () => {
  return {
    OpenAIEmbeddings: jest.fn().mockImplementation(() => {
      return {
        embedDocuments: jest.fn().mockResolvedValue([[0.1, 0.2, 0.3]])
      }
    }),
    ChatOpenAI: jest.fn().mockImplementation(() => {
      return {
        generate: jest.fn().mockResolvedValue({
          generations: [
            [
              {
                text: 'This is a mocked summary.'
              }
            ]
          ]
        })
      }
    })
  }
})

jest.mock('@langchain/core/utils/testing', () => {
  return {
    FakeChatModel: jest.fn().mockImplementation(() => {
      return {
        generate: jest.fn().mockResolvedValue({
          generations: [
            [
              {
                text: 'This is a mocked summary.'
              }
            ]
          ]
        })
      }
    })
  }
})

describe('processor', () => {
  test('generateShortSummary returns a non-empty string', async () => {
    const textToSummarize = 'This is a fake block of text that is being used to test the summarization service.'
    const result = await generateShortSummary(textToSummarize, 60, true) // Using true for FakeChatModel

    expect(typeof result).toBe('string')
    expect(result).not.toBe('')
    expect(result).toBe('This is a mocked summary.')
  })
})
