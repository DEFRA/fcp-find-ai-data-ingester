const config = require('../config')
const { getManifest, uploadManifest, getContainer } = require('../services/blob-client')
const { getFinderGrants, getNumberOfGrants } = require('../services/farming-finder')
const { getVetVisits } = require('../services/vet-visits')
const { getWoodlandGrants } = require('../services/woodland')
const { processGrants } = require('../domain/processor')
const { getWoodlandOfferGrants } = require('../services/woodland-offer')

module.exports = {
  method: 'POST',
  path: '/gather-data',
  handler: async (request, h) => {
    console.log(`Gather data started at ${new Date()}`)

    const containerClient = await getContainer()

    const totalFarmingFinderGrants = await getNumberOfGrants()
    const responseSfi = await processFarmingFinderData(containerClient, totalFarmingFinderGrants)

    const responseWoodland = await processWoodlandData(containerClient)
    const responseVetVisits = await processVetVisitsData(containerClient)
    const responseWoodlandOffer = await processWoodlandOfferData(containerClient)

    console.log(`Finished running gather data at ${new Date()}`)

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

const processVetVisitsData = async (containerClient) => {
  try {
    const manifestFilename = config.vetVisits.manifestFile
    const manifestGrants = await getManifest(manifestFilename)

    const manifestData = [...manifestGrants]

    const grants = await getVetVisits()

    const { chunkCount, processedGrants } = await processGrants(grants, manifestData, 'Vet Visits', containerClient)

    manifestData.push(...processedGrants)

    await uploadManifest(manifestData, manifestFilename, containerClient)

    return {
      chunkCount,
      processedGrantsCount: processedGrants.length
    }
  } catch (error) {
    console.error(error)

    return {
      processedGrantsCount: 0
    }
  }
}

const processWoodlandData = async (containerClient) => {
  try {
    const manifestFilename = config.woodlandCreation.manifestFile
    const manifestGrants = await getManifest(manifestFilename)
    const manifestData = [...manifestGrants]

    const grants = await getWoodlandGrants()

    const grantSchemeName = 'England Woodland Creation Partnerships grants'
    const { chunkCount, processedGrants } = await processGrants(grants, manifestData, grantSchemeName, containerClient)

    manifestData.push(...processedGrants)

    await uploadManifest(manifestData, manifestFilename, containerClient)

    return {
      chunkCount,
      processedGrantsCount: processedGrants.length
    }
  } catch (error) {
    console.error(error)

    return {
      processedGrantsCount: 0
    }
  }
}

const processWoodlandOfferData = async (containerClient) => {
  try {
    const manifestFilename = config.woodlandOffer.manifestFile
    const manifestGrants = await getManifest(manifestFilename)

    const manifestData = [...manifestGrants]

    const grants = await getWoodlandOfferGrants()

    const { chunkCount, processedGrants } = await processGrants(grants, manifestData, 'England Woodland Creation Offer', containerClient)

    manifestData.push(...processedGrants)

    await uploadManifest(manifestData, manifestFilename, containerClient)

    return {
      chunkCount,
      processedGrantsCount: processedGrants.length
    }
  } catch (error) {
    console.error(error)

    return {
      processedGrantsCount: 0
    }
  }
}

const processFarmingFinderData = async (containerClient, count) => {
  try {
    const manifestFilename = config.farmingFinder.manifestFile
    const manifestGrants = await getManifest(manifestFilename)
    const manifestData = [...manifestGrants]

    const grants = await getFinderGrants(count)

    const { chunkCount, processedGrants } = await processGrants(grants, manifestData, 'Sustainable Farming Incentive (SFI)', containerClient)

    manifestData.push(...processedGrants)

    await uploadManifest(manifestData, manifestFilename, containerClient)

    return {
      chunkCount,
      processedGrantsCount: processedGrants.length
    }
  } catch (error) {
    console.error(error)

    return {
      processedGrantsCount: 0
    }
  }
}
