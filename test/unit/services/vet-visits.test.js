const axios = require('axios')
const { getVetVisits } = require('../../../app/services/vet-visits')
const { getMockVetVisits } = require('../../mocks/data/vet-visits')

jest.mock('axios')

describe('vet-visits', () => {
  describe('getVetVisits', () => {
    test('returns vet visit grant as an array', async () => {
      axios.get.mockResolvedValue({ data: getMockVetVisits(), status: 200 })

      const response = await getVetVisits()

      expect(response).toStrictEqual([{
        content: expect.stringContaining('The annual health and welfare review is part of the Sustainable Farming Incentive (SFI) offer'),
        title: 'SFI annual health and welfare review',
        updateDate: new Date('2024-06-07T13:00:06.000Z'),
        url: 'https://www.gov.uk/api/content/government/collections/funding-to-improve-animal-health-and-welfare-guidance-for-farmers-and-vets'
      }])
    })
  })
})
