'use strict';

const babelConfig = require('./.babelrc');

module.exports = (env) => ({
  displayName: env.NODE_ENV === 'module' ? 'build:module' : 'build:main',

  testEnvironment: 'node',
  testMatch: ['<rootDir>/packages/**/*'],
  testPathIgnorePatterns: ['.+\\.d\\.ts$', '.+/dist/.+', '.+/__tests__/.+'],

  haste: {
    '@tunnckocore/jest-runner-babel': {
      outDir: env.NODE_ENV === 'module' ? 'dist/module' : 'dist/main',
      babel: babelConfig,
    },
  },

  runner: './packages/jest-runner-babel/dist/main/index.js',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs'],
  // rootDir: process.cwd(),
});
