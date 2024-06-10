const { chunkDocument } = require('../../../app/utils/chunker')

const lorem = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque finibus facilisis ante. Nam iaculis ultricies mollis. Nunc vestibulum sit amet turpis id porttitor. Cras luctus nibh quis lacus tempor, a tempus ex tristique. Aenean a vehicula nibh. Integer tincidunt nunc eget dolor aliquam imperdiet. Proin metus sapien, pulvinar eget purus at, porttitor rutrum est. Vestibulum id vehicula lorem, nec elementum turpis. In ut vestibulum tellus. Pellentesque mattis eleifend mollis. Maecenas vel dictum elit, eget fermentum turpis. Suspendisse ac dictum nunc, mattis luctus arcu. Nunc aliquet efficitur neque, in facilisis ex consectetur quis.

Praesent nunc ex, volutpat eget elit eu, interdum imperdiet libero. Cras non consectetur odio. Etiam blandit laoreet ligula ut suscipit. Pellentesque at quam vel urna tempus posuere. Nam ornare purus eget nisi lacinia sodales. Phasellus pulvinar maximus dignissim. Mauris vitae tellus et lectus congue scelerisque et in mauris. Mauris at ullamcorper dolor, at tempor libero. Phasellus est augue, sagittis non tempus nec, molestie vel metus. Donec ullamcorper ante eget malesuada aliquet. Cras sed ullamcorper purus. Maecenas vel fringilla elit. Donec quis posuere diam. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.

Nullam pellentesque id neque ac vehicula. Pellentesque ultricies odio vitae ligula eleifend rhoncus. Aliquam erat volutpat. Nam dolor ante, tempor eu tortor vitae, congue rutrum mi. Ut metus nisl, bibendum tempor neque at, porta facilisis enim. Nunc porttitor imperdiet urna, luctus ullamcorper mi facilisis sit amet. Quisque volutpat neque at ligula euismod facilisis. Vestibulum lectus justo, dictum sed molestie finibus, consectetur at turpis.

Quisque id risus volutpat, tristique nisi non, fringilla lectus. Aliquam id ipsum dignissim enim bibendum condimentum. Pellentesque accumsan fringilla mi, ac ultrices nibh lacinia a. Quisque at augue ut mi elementum suscipit quis eu urna. Pellentesque vel bibendum nisl. Vivamus imperdiet est non nunc porttitor, non malesuada est pellentesque. In venenatis dignissim odio, at congue nulla imperdiet a. Mauris aliquet turpis eget sapien eleifend tristique. Sed ac rhoncus odio.

Duis auctor nunc quis nisl viverra, ac pretium eros fringilla. Integer at mauris bibendum, hendrerit tellus quis, posuere arcu. Duis erat lorem, hendrerit a pulvinar ac, bibendum eget justo. In porta urna non lacus dapibus consequat ut vel dui. Nunc porta sodales accumsan. Nunc tristique lectus sit amet sodales euismod. Duis finibus varius orci et ultricies. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Morbi euismod diam scelerisque nunc mollis viverra in sit amet lorem. In volutpat neque risus. Nam rutrum placerat odio. Morbi varius mauris sapien, id hendrerit ipsum bibendum varius. Maecenas nisi quam, laoreet id pulvinar ut, auctor vitae mauris.

`

describe('chunker', () => {
  describe('chunkDocument', () => {
    test('returns chunked small document', () => {
      const chunkedDocument = chunkDocument({
        document: 'Lorem ipsum dolor sit amet',
        title: 'testTest',
        grantSchemeName: 'sfi',
        sourceUrl: 'https://example.com'
      })

      expect(chunkedDocument).toStrictEqual([
        expect.stringContaining('(Title: testTest | Grant Scheme Name: sfi | Source: https://example.com | Chunk Number: 1)===Lorem ipsum')
      ])
    })

    test('returns chunked large document', () => {
      const chunkedDocument = chunkDocument({
        document: lorem,
        title: 'testTest',
        grantSchemeName: 'sfi',
        sourceUrl: 'https://example.com'
      })

      expect(chunkedDocument).toStrictEqual([
        expect.stringContaining('(Title: testTest | Grant Scheme Name: sfi | Source: https://example.com | Chunk Number: 1)===Lorem ipsum'),
        expect.stringContaining('(Title: testTest | Grant Scheme Name: sfi | Source: https://example.com | Chunk Number: 2)===Quisque volutpat neque')
      ])
    })
  })
})
