const axios = require('axios')
const { getMockLinks } = require('../../mocks/data/search-links')
const { getFinderGrants, getNumberOfGrants } = require('../../../app/services/farming-finder')
const { getMockGrant } = require('../../mocks/data/finder-grant')

jest.mock('axios')

describe('find-farming', () => {
  describe('getNumberOfGrants', () => {
    test('returns the number of total grants in farming finder', async () => {
      const linksResponse = getMockLinks()
      axios.get.mockResolvedValueOnce({ data: linksResponse })

      const response = await getNumberOfGrants()

      expect(response).toBe(101)
    })
  })

  describe('getFinderGrants', () => {
    test('returns grants from farming finder', async () => {
      const linksResponse = getMockLinks()
      axios.get.mockResolvedValueOnce({ data: linksResponse })

      axios.get.mockResolvedValue({ data: getMockGrant() })

      const response = await getFinderGrants(1)

      expect(response).toStrictEqual(expect.arrayContaining([
        expect.objectContaining({
          title: 'SOH1: No-till farming',
          content: expect.stringContaining('This is an action in the Sustainable Farming Incentive (SFI) scheme'),
          updateDate: new Date('2024-05-31T10:39:36.000Z'),
          url: 'https://www.gov.uk/api/content/find-funding-for-land-or-farms/clig3-manage-grassland-with-very-low-nutrient-inputs'
        })
      ]))
    })
  })
})
