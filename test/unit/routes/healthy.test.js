const healthy = require('../../../app/routes/healthy')

describe('/healthy', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    process.env.BLOB_STORAGE_CONNECTION_STRING = 'testConnectionString'
    process.env.BLOB_STORAGE_CONTAINER = 'testContainerName'
  })

  test('should return success', async () => {
    const mockRequest = {}
    const mockH = {
      response: jest.fn(() => {
        return {
          code: jest.fn()
        }
      })
    }

    await healthy.handler(mockRequest, mockH)

    expect(mockH.response).toHaveBeenCalled()
  })
})
