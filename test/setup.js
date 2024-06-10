jest.mock('joi', () => ({
  string: jest.fn().mockReturnValue({
    optional: jest.fn()
  }),
  object: jest.fn().mockReturnValue({
    validate: jest.fn().mockReturnValue({
      error: undefined
    })
  })
}))
