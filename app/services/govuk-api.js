const axios = require('axios').default
const { webpageToMarkdown, stripLinksFromMarkdown } = require('../utils/markdown-utils')

/**
 * @typedef {{title: string, content: string, updateDate: Date, url: string}} Grant
 */

/**
 * Fetches content from GOV.UK
 * @param {string} url - GOV.UK API URL (Needs to include /api/content in the URL)
 * @returns {Promise<Grant>}
 */
const getGovukContent = async (url) => {
  const response = await axios.get(url)
  const responseJSON = response.data

  let title = responseJSON.title
  const updateDate = new Date(responseJSON.updated_at)

  title = title.replace('\\', '')
  title = title.replace('/', 'or')

  const responseBody = responseJSON.details.body

  const markdownContent = webpageToMarkdown(responseBody)
  const strippedContent = stripLinksFromMarkdown(markdownContent)

  return {
    title,
    content: strippedContent,
    updateDate,
    url
  }
}

module.exports = {
  getGovukContent
}
