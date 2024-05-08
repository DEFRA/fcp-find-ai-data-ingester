const mockStart = jest.fn()
jest.mock('../../app/server', () => ({
  start: mockStart,
  info: {
    uri: 'server-uri'
  }
}))
const server = require('../../app/server')

describe('Server setup', () => {
  let spyExit
  let spyError

  beforeEach(() => {
    jest.clearAllMocks()
    spyExit = jest.spyOn(process, 'exit').mockImplementation(() => {})
    spyError = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    spyExit.mockRestore()
    spyError.mockRestore()
  })

  test('start the server', async () => {
    require('../../app/index')
    expect(server.start).toHaveBeenCalled()
  })
})
