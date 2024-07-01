const config = require('../config')
const { getContainer } = require('../services/blob-client')
const { getFinderGrants, getNumberOfGrants } = require('../services/farming-finder')
const { getVetVisits } = require('../services/vet-visits')
const { getWoodlandGrants } = require('../services/woodland')
const { process } = require('../domain/processor')
const { getWoodlandOfferGrants } = require('../services/woodland-offer')
const { getSearchClient } = require('../services/azure-search-service')
const { logger } = require('../lib/logger')

module.exports = {
  method: 'POST',
  path: '/gather-data',
  handler: async (request, h) => {
    logger.info(`Gather data started at ${new Date()}`)

    const containerClient = await getContainer()
    const searchClient = await getSearchClient()

    const totalFarmingFinderGrants = await getNumberOfGrants()
    const responseSfi = await processFarmingFinderData({ containerClient, searchClient, count: totalFarmingFinderGrants })

    const responseWoodland = await processWoodlandData({ containerClient, searchClient })
    const responseVetVisits = await processVetVisitsData({ containerClient, searchClient })
    const responseWoodlandOffer = await processWoodlandOfferData({ containerClient, searchClient })

    logger.info(`Finished running gather data at ${new Date()}`)

    const results = {
      farmingFinder: {
        addedGrants: responseSfi.processedGrantsCount
      },
      woodlandCreationPartnership: {
        addedGrants: responseWoodland.processedGrantsCount
      },
      vetVisits: {
        addedGrants: responseVetVisits.processedGrantsCount
      },
      woodlandOffer: {
        addedGrants: responseWoodlandOffer.processedGrantsCount
      }
    }

    return h.response(results).code(200)
  }
}

const processVetVisitsData = async ({ containerClient, searchClient }) => {
  const scheme = config.vetVisits
  const grants = await getVetVisits()

  const result = await processGrants({
    grants,
    scheme,
    containerClient,
    searchClient
  })

  return result
}

const processWoodlandData = async ({ containerClient, searchClient }) => {
  const scheme = config.woodlandCreation
  const grants = await getWoodlandGrants()

  const result = await processGrants({
    grants,
    scheme,
    containerClient,
    searchClient
  })

  return result
}

const processWoodlandOfferData = async ({ containerClient, searchClient }) => {
  const scheme = config.woodlandOffer
  const grants = await getWoodlandOfferGrants()

  const result = await processGrants({
    grants,
    scheme,
    containerClient,
    searchClient
  })

  return result
}

const processFarmingFinderData = async ({ containerClient, searchClient, count }) => {
  const scheme = config.farmingFinder
  const grants = await getFinderGrants(count)

  const result = await processGrants({
    grants,
    scheme,
    containerClient,
    searchClient
  })

  return result
}

const processGrants = async ({ grants, scheme, containerClient, searchClient, count }) => {
  try {
    const { chunkCount, processedGrants } = await process({
      grants,
      scheme,
      containerClient,
      searchClient
    })

    return {
      chunkCount,
      processedGrantsCount: processedGrants.length
    }
  } catch (error) {
    logger.error(error)

    return {
      processedGrantsCount: 0
    }
  }
}
