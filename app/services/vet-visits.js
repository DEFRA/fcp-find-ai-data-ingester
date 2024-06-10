const config = require('../config')
const { getGovukContent } = require('./govuk-api')

async function getVetVisits () {
  const grant = await getGovukContent(config.vetVisits.url)

  return [grant]
}

module.exports = {
  getVetVisits
}
