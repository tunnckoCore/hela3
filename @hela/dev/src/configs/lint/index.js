import path from 'path';
import { getWorkspacesAndExtensions } from '@tunnckocore/utils';

/* eslint-disable import/prefer-default-export */

export function createLintConfig(opts) {
  const { workspaces, exts } = getWorkspacesAndExtensions(opts.cwd);
  const srcGlob = ['src', '**', '*'];

  const wsRoots =
    workspaces.length > 0 ? workspaces.map((w) => path.join(w, '*')) : [''];

  const matches = wsRoots.map((ws) =>
    path.join('<rootDir>', ...[ws, ...srcGlob].filter(Boolean)),
  );

  return {
    displayName: 'lint',

    testEnvironment: 'node',
    testMatch: matches,
    testPathIgnorePatterns: [
      '.+/dist/.+',

      // @hela/dev specific
      '.+/configs/build/config\\.js$',
      '.+/configs/lint/config\\.js$',
      '.+/configs/test/config\\.js$',
    ],

    // TODO: include in this monorepo
    // haste: {
    //   '@tunnckocore/jest-runner-eslint': {},
    // },

    runner: 'jest-runner-eslint',
    moduleFileExtensions: exts,
    rootDir: opts.cwd,
  };
}
