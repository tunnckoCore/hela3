import { getWorkspacesAndExtensions } from '@tunnckocore/utils';

/* eslint-disable import/prefer-default-export */

export function createTestConfig(opts) {
  const { exts } = getWorkspacesAndExtensions(opts.cwd);

  return {
    displayName: 'test',

    testEnvironment: 'node',
    testPathIgnorePatterns: ['.+/dist/.+'],

    moduleFileExtensions: exts,
    rootDir: opts.cwd,
  };
}
