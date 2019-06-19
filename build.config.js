'use strict';

const getBabelConfig = require('./babel-main-config');

module.exports = (env) => ({
  displayName: env.NODE_ENV === 'module' ? 'build:module' : 'build:main',

  testEnvironment: 'node',
  testMatch: ['<rootDir>/packages/**/*'],
  testPathIgnorePatterns: ['.+\\.d\\.ts$', '.+/dist/.+', '.+/__tests__/.+'],

  haste: {
    '@tunnckocore/jest-runner-babel': {
      outDir:
        env.NODE_ENV === 'module' ? 'dist/build/module' : 'dist/build/main',
      babel: getBabelConfig(env),
    },
  },

  runner: './packages/jest-runner-babel/dist/build/main/index.js',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs'],
  // rootDir: process.cwd(),
});
