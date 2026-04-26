/**
 * Jest config for the Cloud Functions package. Runs the unit tests under
 * src/__tests__ via ts-jest. The Firebase runtime modules aren't pulled in
 * here because the tests target the pure helpers under src/lib/*.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['src/lib/**/*.ts'],
};
