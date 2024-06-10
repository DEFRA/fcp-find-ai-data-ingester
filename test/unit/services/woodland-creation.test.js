const { default: axios } = require('axios')
const { getMockWoodlandCreationGrants } = require('../../mocks/data/woodland-creation')
const { getWoodlandGrants } = require('../../../app/services/woodland')

jest.mock('axios')

describe('woodland-creation', () => {
  describe('getWoodlandGrants', () => {
    test('returns woodland creation grants as an array', async () => {
      axios.get.mockResolvedValue({ data: getMockWoodlandCreationGrants() })

      const response = await getWoodlandGrants()

      expect(response).toStrictEqual(expect.arrayContaining([
        {
          title: 'National Forest Company - Small Grants Fund',
          content: expect.stringContaining('The Small Grants Fund offers small grants to a range of landowners'),
          updateDate: new Date('2024-05-01T14:11:43.000Z'),
          url: 'https://www.gov.uk/api/content/government/publications/england-woodland-creation-partnerships-grants-and-advice-table/england-woodland-creation-partnerships-grants-and-advice-table'
        },
        {
          content: expect.stringContaining('The Grow Back Greener programme is co-ordinated by the Woodland Trust'),
          title: 'Northern Forest Partnership Grow Back Greener (Woodland Trust and CFT)',
          updateDate: new Date('2024-05-01T14:11:43.000Z'),
          url: 'https://www.gov.uk/api/content/government/publications/england-woodland-creation-partnerships-grants-and-advice-table/england-woodland-creation-partnerships-grants-and-advice-table'
        }
      ]))
    })
  })
})
