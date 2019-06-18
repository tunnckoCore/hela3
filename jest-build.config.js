'use strict';

const babelConfig = require('./.babelrc');

const isModule = process.env.NODE_ENV === 'module';

module.exports = {
  displayName: isModule ? 'build:module' : 'build:main',

  testEnvironment: 'node',
  testMatch: ['<rootDir>/packages/**/*'],
  testPathIgnorePatterns: ['.+\\.d\\.ts$', '.+/dist/.+', '.+/__tests__/.+'],

  haste: {
    '@tunnckocore/jest-runner-babel': {
      outDir: isModule ? 'dist/module' : 'dist/main',
      babel: babelConfig,
    },
  },

  runner: './packages/jest-runner-babel/dist/main/index.js',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs'],
  // rootDir: process.cwd(),
};
