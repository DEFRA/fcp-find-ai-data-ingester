const Joi = require('joi')

if (process.env.NODE_ENV !== 'test') {
  require('dotenv').config()
}

const schema = Joi.object({
  env: Joi.string(),

  appInsightsKey: Joi.string().optional(),
  logLevel: Joi.string().default('error'),

  azureOpenAI: Joi.object({
    searchUrl: Joi.string().required(),
    searchApiKey: Joi.string().required(),
    summaryIndexName: Joi.string().required(),
    indexName: Joi.string().required(),
    primaryKeyName: Joi.string().required(),

    openAiInstanceName: Joi.string().required(),
    openAiKey: Joi.string().required(),
    openAiModelName: Joi.string().required()
  }),

  blobStorage: Joi.object({
    connectionString: Joi.string().required(),
    containerName: Joi.string().required()
  }),

  farmingFinder: Joi.object({
    searchUrl: Joi.string().required(),
    findFarmingUrl: Joi.string().required(),
    manifestFile: Joi.string().required(),
    schemeName: Joi.string().required()
  }),

  vetVisits: Joi.object({
    url: Joi.string().required(),
    manifestFile: Joi.string().required(),
    schemeName: Joi.string().required()
  }),

  woodlandCreation: Joi.object({
    url: Joi.string().required(),
    manifestFile: Joi.string().required(),
    schemeName: Joi.string().required()
  }),

  woodlandOffer: Joi.object({
    url: Joi.string().required(),
    manifestFile: Joi.string().required(),
    schemeName: Joi.string().required()
  })
})

const config = {
  env: process.env.NODE_ENV,

  appInsightsKey: process.env.APPINSIGHTS_CONNECTIONSTRING,
  logLevel: process.env.LOG_LEVEL || 'error',

  azureOpenAI: {
    searchUrl: process.env.AZURE_AISEARCH_ENDPOINT,
    searchApiKey: process.env.AZURE_AISEARCH_KEY,
    summaryIndexName: process.env.AZURE_SEARCH_SUMMARIES_INDEX_NAME,
    indexName: process.env.AZURE_SEARCH_INDEX_NAME,
    primaryKeyName: 'chunk_id',

    openAiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
    openAiKey: process.env.AZURE_OPENAI_API_KEY,
    openAiModelName: process.env.AZURE_OPENAI_MODEL_NAME
  },

  blobStorage: {
    connectionString: process.env.BLOB_STORAGE_CONNECTION_STRING || '',
    containerName: process.env.BLOB_STORAGE_CONTAINER || ''
  },

  farmingFinder: {
    searchUrl: 'https://www.gov.uk/api/search.json?filter_format=farming_grant',
    findFarmingUrl: 'https://www.gov.uk/api/content',
    manifestFile: 'manifest-farming-finder.json',
    schemeName: 'Sustainable Farming Incentive (SFI)'
  },

  vetVisits: {
    url: 'https://www.gov.uk/api/content/government/collections/funding-to-improve-animal-health-and-welfare-guidance-for-farmers-and-vets',
    manifestFile: 'manifest-vet-visits.json',
    schemeName: 'Vet Visits'
  },

  // England Woodland Creation Partnerships grants and advice table
  woodlandCreation: {
    url: 'https://www.gov.uk/api/content/government/publications/england-woodland-creation-partnerships-grants-and-advice-table/england-woodland-creation-partnerships-grants-and-advice-table',
    manifestFile: 'manifest-woodland-creation.json',
    schemeName: 'England Woodland Creation Partnerships grants'
  },

  // England Woodland Creation Offer
  woodlandOffer: {
    url: 'https://www.gov.uk/api/content/guidance/england-woodland-creation-offer',
    manifestFile: 'manifest-woodland-offer.json',
    schemeName: 'England Woodland Creation Offer'
  }
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The server config is invalid. ${result.error.message}`)
}

module.exports = config
