const { webpageToMarkdown, stripLinksFromMarkdown } = require('../../../app/utils/markdown-utils')

describe('markdown-utils', () => {
  describe('webpageToMarkdown', () => {
    test('returns markdown from html string', () => {
      const html = '<h1>Title text</h1>'

      const result = webpageToMarkdown(html)

      expect(result).toBe('# Title text')
    })

    test('returns undefined if html is undefined', () => {
      const html = undefined

      const result = webpageToMarkdown(html)

      expect(result).toBe(undefined)
    })
  })

  describe('stripLinksFromMarkdown', () => {
    test('returns markdown without links', () => {
      const content = `
        # title
        [link](https://example.com)
      `

      const expectedResult = `
        # title
        link
      `

      const result = stripLinksFromMarkdown(content)

      expect(result).toBe(expectedResult)
    })
  })
})
