/* eslint-disable import/prefer-default-export */

export function createTestConfig(opts) {
  return {
    displayName: 'test',

    testEnvironment: 'node',
    testPathIgnorePatterns: ['.+/dist/.+'],

    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs'],
    rootDir: opts.cwd,
  };
}
