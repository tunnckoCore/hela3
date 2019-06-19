// import micromatch from 'micromatch';

import path from 'path';
import babelConfig from '../babel';

/* eslint-disable import/prefer-default-export */

export function createBuildConfig(options) {
  const opts = Object.assign(
    {
      // TODO: using `micromatch`
      // match: 'packages/**/*',
      // ignore: ['**/*.d.ts', '**/dist/**', '**/__tests__/**'],
      env: { NODE_ENV: 'main' },
    },
    options,
  );

  // TODO: using `micromatch`
  // const ignores = []
  //   .concat(opts.ignore)
  //   .filter(Boolean)
  //   .map((pattern) => micromatch.makeRe(pattern).toString());

  // const matches = []
  //   .concat(micromatch(opts.match))
  //   .filter(Boolean)
  //   .map((pattern) => `<root>/${pattern}`);

  const match = opts.mono ? 'packages/*/src/**/*' : 'src/**/*';
  const esmDest = opts.dest
    ? path.join(opts.dest, 'module')
    : 'dist/build/module';
  const cjsDest = opts.dest ? path.join(opts.dest, 'main') : 'dist/build/main';

  return {
    displayName: opts.env.NODE_ENV === 'module' ? 'build:esm' : 'build:cjs',

    testEnvironment: 'node',
    testMatch: [`<rootDir>/${match}`],
    testPathIgnorePatterns: [
      '.+/__tests__/.+',
      '.+/dist/.+',

      // @hela/dev specific
      '.+/configs/build/config\\.js$',
      '.+/configs/lint/config\\.js$',
    ],

    haste: {
      '@tunnckocore/jest-runner-babel': {
        outDir: opts.env.NODE_ENV === 'module' ? esmDest : cjsDest,
        babel: babelConfig.default && babelConfig,
      },
    },

    runner: '@tunnckocore/jest-runner-babel',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs', 'json'],
    rootDir: opts.cwd,
  };
}
