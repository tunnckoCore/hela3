import path from 'path';
import { getWorkspacesAndExtensions } from '@tunnckocore/utils';

/* eslint-disable import/prefer-default-export */

// ! keep in sync with babel config inside `src/configs/babel.js`
export function createBuildConfig(options) {
  const opts = { ...options };

  // TODO: using `micromatch`, Jest 25 will simplify the matching
  // const ignores = []
  //   .concat(opts.ignore)
  //   .filter(Boolean)
  //   .map((pattern) => micromatch.makeRe(pattern).toString());

  // const matches = []
  //   .concat(micromatch(opts.match))
  //   .filter(Boolean)
  //   .map((pattern) => `<root>/${pattern}`);

  const { workspaces, exts } = getWorkspacesAndExtensions(opts.cwd);
  const srcGlob = ['src', '**', '*'];

  const wsRoots =
    workspaces.length > 0 ? workspaces.map((w) => path.join(w, '*')) : [''];

  const matches = wsRoots.map((ws) =>
    path.join('<rootDir>', ...[ws, ...srcGlob].filter(Boolean)),
  );

  const esmDest = opts.dest ? path.join(opts.dest, 'esm') : 'dist/build/esm';
  const cjsDest = opts.dest ? path.join(opts.dest, 'main') : 'dist/build/cjs';

  return {
    displayName: opts.format === 'esm' ? 'build:esm' : 'build:cjs',

    testEnvironment: 'node',
    testMatch: matches,
    testPathIgnorePatterns: [
      '.+/__tests__/.+',
      '.+/fixtures/.+',
      '.+/jest-runner-babel/.+',
      '.+/utils/.+',
      '.+/dist/.+',

      // @hela/dev specific
      '.+/configs/build/config\\.js$',
      '.+/configs/lint/config\\.js$',
      '.+/configs/test/config\\.js$',
    ],

    haste: {
      '@tunnckocore/jest-runner-babel': {
        outDir: opts.format === 'esm' ? esmDest : cjsDest,
        workspaces,
        // ! keep in sync with `src/configs/babel.js`
        babel: {
          // ignore: (opts.env.NODE_ENV === 'test'
          //   ? []
          //   : ['**/__tests__/**']
          // ).concat('**/jest-runner-babel/**'),
          presets: [
            [
              '@babel/preset-env',
              {
                targets: { node: '10.13' },
                modules: opts.format === 'esm' ? false : 'commonjs',
              },
            ],
            '@babel/preset-react',
            '@babel/preset-typescript',
          ],
          plugins: [
            '@babel/plugin-syntax-dynamic-import',
            '@babel/plugin-syntax-import-meta',
            'babel-plugin-dynamic-import-node-babel-7',
          ],
          comments: false,
        },
      },
    },

    runner: '@tunnckocore/jest-runner-babel',
    moduleFileExtensions: exts.concat('json'),
    rootDir: opts.cwd,
  };
}
