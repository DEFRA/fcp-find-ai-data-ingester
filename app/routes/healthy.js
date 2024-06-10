const { logger } = require('../lib/logger')

module.exports = {
  method: 'GET',
  path: '/healthy',
  handler: (request, h) => {
    logger.info('test logger')

    return h.response('ok').code(200)
  }
}
