describe('Healthz test', () => {
  const server = require('../../../../app/server')

  beforeEach(async () => {
    process.env.BLOB_STORAGE_CONNECTION_STRING = 'testConnectionString'
    process.env.BLOB_STORAGE_CONTAINER = 'testContainerName'

    await server.start()
  })

  test('GET /healthz route returns 200', async () => {
    const options = {
      method: 'GET',
      url: '/healthz'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  afterEach(async () => {
    await server.stop()
  })
})
