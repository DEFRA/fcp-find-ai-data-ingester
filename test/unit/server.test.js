jest.mock('../../app/insights', () => {
  return {
    setup: jest.fn()
  }
})
const appInsights = require('../../app/insights')

jest.mock('@hapi/hapi', () => {
  return {
    server: jest.fn().mockImplementation(() => {
      return {
        route: jest.fn()
      }
    })
  }
})

describe('Server setup', () => {
  test('should setup app insights and start the server', async () => {
    require('../../app/server')
    expect(appInsights.setup).toHaveBeenCalled()
  })
})
