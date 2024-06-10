const appInsights = require('applicationinsights')

const setup = () => {
  if (process.env.APPINSIGHTS_CONNECTIONSTRING) {
    appInsights
      .setup(process.env.APPINSIGHTS_CONNECTIONSTRING)
      .start()

    const cloudRoleTag = appInsights.defaultClient.context.keys.cloudRole
    const appName = process.env.APPINSIGHTS_CLOUDROLE
    appInsights.defaultClient.context.tags[cloudRoleTag] = appName

    return appInsights
  } else {
    console.log('App Insights not running')
  }
}

process.on('unhandledRejection', (err) => {
  console.error(err)
  appInsights.logException(err, null)
  process.exit(1)
})

const logException = (error, request) => {
  try {
    const client = appInsights.defaultClient

    if (client) {
      // Remove PII
      delete request.headers.cookie

      client?.trackException({
        exception: error,
        properties: {
          statusCode: request ? request.statusCode : '',
          sessionId: request ? request.yar?.id : '',
          payload: request ? request.payload : '',
          request: request ?? 'Server Error'
        }
      })
    }
  } catch (err) {
    console.error(err, 'App Insights')
  }
}

const logTrace = ({ message, severity }, request) => {
  try {
    const client = appInsights.defaultClient

    if (client) {
      client.trackTrace({
        message,
        severity
      })
    }
  } catch (error) {
    console.error(error, 'App Insights logTrace failed')
  }
}

module.exports = { setup, logTrace, logException }
