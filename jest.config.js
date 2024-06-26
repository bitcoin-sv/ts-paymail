/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['dist/'],
    testTimeout: 30000,
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
}
  