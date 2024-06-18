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
    let addedFarmingFinderGrants = 0
    let count = 40
    // This is used as Azure blob storage seems to rate limit us if we upload more than 70 documents (300 chunk uploads)
    while (count <= totalFarmingFinderGrants + 40) {
      const response = await processFarmingFinderData(containerClient, count)
      count += 40
      addedFarmingFinderGrants += response.processedGrantsCount
      await sleep(5000)
    }

    const responseWoodland = await processWoodlandData(containerClient)
    const responseVetVisits = await processVetVisitsData(containerClient)
    const responseWoodlandOffer = await processWoodlandOfferData(containerClient)

    console.log(`Finished running gather data at ${new Date()}`)

    const results = {
      farmingFinder: {
        addedGrants: addedFarmingFinderGrants
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
}

const processWoodlandData = async (containerClient) => {
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
}

const processWoodlandOfferData = async (containerClient) => {
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
}

const processFarmingFinderData = async (containerClient, count) => {
  const manifestFilename = config.farmingFinder.manifestFile
  const manifestGrants = await getManifest(manifestFilename)
  // TODO Test whether manifest data is duplicated when adding the processed grants
  const manifestData = [...manifestGrants]

  const grants = await getFinderGrants(count)

  const { chunkCount, processedGrants } = await processGrants(grants, manifestData, 'Sustainable Farming Incentive (SFI)', containerClient)

  manifestData.push(...processedGrants)

  await uploadManifest(manifestData, manifestFilename, containerClient)

  return {
    chunkCount,
    processedGrantsCount: processedGrants.length
  }
}

function sleep (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
