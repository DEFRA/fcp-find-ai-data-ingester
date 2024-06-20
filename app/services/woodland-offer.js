const config = require('../config')
const { getGovukContent } = require('./govuk-api')

async function getWoodlandOfferGrants () {
  const grant = await getGovukContent(config.woodlandOffer.url)

  return [grant]
}

module.exports = {
  getWoodlandOfferGrants
}
