'use strict';

const babelConfig = require('./.babelrc');

module.exports = {
  displayName: 'build',

  testEnvironment: 'node',
  testMatch: ['<rootDir>/packages/**/*'],
  testPathIgnorePatterns: ['.+\\.d\\.ts$', '.+/dist/.+', '.+/__tests__/.+'],

  haste: {
    '@tunnckocore/jest-runner-babel': {
      outDir: 'dist',
      babel: babelConfig,
    },
  },

  runner: './packages/jest-runner-babel/dist/index.js',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs'],
  // rootDir: process.cwd(),
};
