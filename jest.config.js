/**
 * Logic-only Jest config. We deliberately avoid jest-expo / RN component
 * testing here — the goal is fast unit tests for our pure modules
 * (astro engine, stores, services). UI snapshot tests can be added later
 * by switching to jest-expo and adding the Reanimated/Gesture mocks.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testPathIgnorePatterns: ['/node_modules/', '/.expo/'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
  },
};
