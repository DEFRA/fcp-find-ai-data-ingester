const Joi = require('joi')

if (process.env.NODE_ENV !== 'test') {
  require('dotenv').config()
}

const schema = Joi.object({
  env: Joi.string(),

  appInsightsKey: Joi.string().optional(),
  logLevel: Joi.string().optional(),

  azureOpenAI: Joi.object({
    searchUrl: Joi.string(),
    searchApiKey: Joi.string(),
    indexName: Joi.string(),

    openAiInstanceName: Joi.string(),
    openAiKey: Joi.string()
  }),

  blobStorage: Joi.object({
    connectionString: Joi.string(),
    containerName: Joi.string()
  }),

  farmingFinder: Joi.object({
    searchUrl: Joi.string(),
    findFarmingUrl: Joi.string(),
    manifestFile: Joi.string()
  }),

  vetVisits: Joi.object({
    url: Joi.string(),
    manifestFile: Joi.string()
  }),

  woodlandCreation: Joi.object({
    url: Joi.string(),
    manifestFile: Joi.string()
  }),

  woodlandOffer: Joi.object({
    url: Joi.string(),
    manifestFile: Joi.string()
  })
})

const config = {
  env: process.env.NODE_ENV,

  appInsightsKey: process.env.APPINSIGHTS_CONNECTIONSTRING,
  logLevel: process.env.LOG_LEVEL || 'error',

  azureOpenAI: {
    searchUrl: process.env.AZURE_AISEARCH_ENDPOINT,
    searchApiKey: process.env.AZURE_AISEARCH_KEY,
    indexName: process.env.AZURE_SEARCH_INDEX_NAME,

    openAiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
    openAiKey: process.env.AZURE_OPENAI_API_KEY
  },

  blobStorage: {
    connectionString: process.env.BLOB_STORAGE_CONNECTION_STRING || '',
    containerName: process.env.BLOB_STORAGE_CONTAINER || ''
  },

  farmingFinder: {
    searchUrl: 'https://www.gov.uk/api/search.json?filter_format=farming_grant',
    findFarmingUrl: 'https://www.gov.uk/api/content',
    manifestFile: 'manifest-farming-finder.json'
  },

  vetVisits: {
    url: 'https://www.gov.uk/api/content/government/collections/funding-to-improve-animal-health-and-welfare-guidance-for-farmers-and-vets',
    manifestFile: 'manifest-vet-visits.json'
  },

  // England Woodland Creation Partnerships grants and advice table
  woodlandCreation: {
    url: 'https://www.gov.uk/api/content/government/publications/england-woodland-creation-partnerships-grants-and-advice-table/england-woodland-creation-partnerships-grants-and-advice-table',
    manifestFile: 'manifest-woodland-creation.json'
  },

  // England Woodland Creation Offer
  woodlandOffer: {
    url: 'https://www.gov.uk/api/content/guidance/england-woodland-creation-offer',
    manifestFile: 'manifest-woodland-offer.json'
  }
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The server config is invalid. ${result.error.message}`)
}

module.exports = config
