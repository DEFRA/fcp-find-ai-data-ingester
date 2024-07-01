const axios = require('axios').default
const config = require('../config')
const { logger } = require('../lib/logger')
const { getGovukContent } = require('../services/govuk-api')

/**
 * Get grants from "Find funding for land or farms" finder
 * @param {number} count
 * @returns {Promise<import('../services/govuk-api').Grant[]>}
 */
async function getFinderGrants (count) {
  const urls = await getLinksFromSearchApi(count)
  const grants = []

  for (const url of urls) {
    try {
      const grant = await getGovukContent(url)

      grants.push(grant)
    } catch (error) {
      logger.error(error)
    }
  }

  return grants
}

/**
 * Get "link" values from search API from Specialist Publisher tool
 * @param {number} count
 * @returns {Promise<string[]>}
 */
async function getLinksFromSearchApi (count) {
  const url = `${config.farmingFinder.searchUrl}&count=${count}`
  const response = await axios.get(url)
  const searchApiResponse = response.data

  const links = searchApiResponse.results.map((result) => config.farmingFinder.findFarmingUrl + result.link)

  return links
}

/**
 * Get the total number of grants in farming funding finder
 * @returns {number}
 */
async function getNumberOfGrants () {
  const url = `${config.farmingFinder.searchUrl}`
  const response = await axios.get(url)
  const searchAPIResponse = response.data

  return searchAPIResponse.total
}

module.exports = {
  getFinderGrants,
  getNumberOfGrants
}
