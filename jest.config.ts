import type { JestConfigWithTsJest } from 'ts-jest';

/** @type {JestConfigWithTsJest} */
const config: JestConfigWithTsJest = {
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', 'src'],
  extensionsToTreatAsEsm: ['.ts'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transformIgnorePatterns: [
    '/node_modules/(?!supertest)/',
  ],
  transform: {
    '^.+\\.(ts)$': ['ts-jest', { isolatedModules: true }],
  },
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
};

export default config;