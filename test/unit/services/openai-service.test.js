const { generateShortSummary } = require('../../../app/services/openai-service')

jest.mock('@azure/storage-blob')
jest.mock('../../../app/utils/chunker')
jest.mock('../../../app/services/blob-client')

describe('processor', () => {
  test('generateShortSummary returns a non-empty string', async () => {
    const textToSummarize = 'This is a fake block of text that is being used to test the summarization service.'
    const result = await generateShortSummary(textToSummarize, 60, true)

    expect(typeof result).toBe('string')
    expect(result).not.toBe('')
  })
})
