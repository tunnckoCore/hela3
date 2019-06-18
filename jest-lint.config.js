'use strict';

module.exports = {
  displayName: 'lint',

  testEnvironment: 'node',
  testMatch: ['<rootDir>/packages/**/*'],
  testPathIgnorePatterns: ['.+\\.d\\.ts$', '.+/dist/.+'],

  runner: 'jest-runner-eslint',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs'],
};
