'use strict';

const createBuildConfig = require('./build.config');

module.exports = {
  projects: [
    {
      displayName: 'lint',

      testEnvironment: 'node',
      testMatch: ['<rootDir>/packages/**/*'],
      testPathIgnorePatterns: ['.+\\.d\\.ts$', '.+/dist/.+'],

      runner: 'jest-runner-eslint',
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs'],
    },
    createBuildConfig({ NODE_ENV: 'main' }),
    createBuildConfig({ NODE_ENV: 'module' }),
  ],
};
