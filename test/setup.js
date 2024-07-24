process.env.LOG_LEVEL = 'error'

jest.mock('joi', () => ({
  string: jest.fn().mockReturnValue({
    optional: jest.fn(),
    default: jest.fn(),
    required: jest.fn()
  }),
  object: jest.fn().mockReturnValue({
    validate: jest.fn().mockReturnValue({
      error: undefined
    })
  })
}))
