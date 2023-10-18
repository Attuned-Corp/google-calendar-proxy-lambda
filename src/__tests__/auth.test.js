const { isAccessTokenValid } = require("../auth");

describe('auth', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules() // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  test('fails if access tokens are different', () => {
    // Set the variables
    process.env.PROXY_LAMBDA_ACCESS_TOKEN = 'sample_access_token';

    expect(isAccessTokenValid('different_token')).toBeFalsy()
  });

  test('succeeds if access tokens are the same', () => {
    // Set the variables
    process.env.PROXY_LAMBDA_ACCESS_TOKEN = 'sample_access_token';

    expect(isAccessTokenValid('sample_access_token')).toBeTruthy()
  });
});