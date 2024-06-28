require('./insights').setup()
const Hapi = require('@hapi/hapi')

const server = Hapi.server({
  port: process.env.PORT,
  routes: {
    timeout: {
      server: 600000,
      socket: false
    }
  }
})

const routes = [].concat(
  require('./routes/healthy'),
  require('./routes/healthz'),
  require('./routes/gather-data')
)

server.route(routes)

module.exports = server
