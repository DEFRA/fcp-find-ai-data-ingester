const createAbstractTransport = require('pino-abstract-transport')
const { pinoLevelToSeverityLevel } = require('./log-levels')

module.exports = () => {
  const appInsights = require('../insights')

  return createAbstractTransport(async (source) => {
    for await (const data of source) {
      if (!data) {
        continue
      }

      if (data.res) {
        continue
      }

      if (data.err) {
        // Prevent logging App insight's write EPIPE errors
        if (data.tags?.includes('client')) {
          continue
        }

        const error = new Error(data.err.message)
        error.stack = data.err?.stack
        console.error(error)
        appInsights.logException(error, data.req)

        continue
      }

      appInsights.logTrace({
        message: data.msg,
        severity: pinoLevelToSeverityLevel(data.level)
      })
    }
  })
}
