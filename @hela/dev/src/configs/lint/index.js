import path from 'path';
import { getWorkspacesAndExtensions } from '@tunnckocore/utils';

/* eslint-disable import/prefer-default-export */

export function createLintConfig(opts) {
  const { workspaces, exts } = getWorkspacesAndExtensions(opts.cwd);
  const roots = workspaces.length > 0 ? workspaces : ['src/**/*'];

  return {
    displayName: 'lint',

    testEnvironment: 'node',
    testMatch: roots.map((ws) =>
      path.join(`<rootDir>`, ws, '*', 'src', '**', '*'),
    ),
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
