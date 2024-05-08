const healthz = require('../../../app/routes/healthz')

describe('/healthz', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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

    await healthz.handler(mockRequest, mockH)

    expect(mockH.response).toHaveBeenCalled()
  })
})
