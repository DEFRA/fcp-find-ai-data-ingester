const pino = require('pino')
const appInsightsTransport = require('../lib/insights-transport')
const config = require('../config')

const getLogger = () => {
  if (config.env === 'production') {
    return pino({}, appInsightsTransport())
  }

  return pino({
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  })
}

const logger = getLogger()

module.exports = {
  getLogger,
  logger
}
