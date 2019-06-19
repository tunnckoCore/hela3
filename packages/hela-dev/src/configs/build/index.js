// import micromatch from 'micromatch';

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
  return {
    displayName: opts.env.NODE_ENV === 'module' ? 'build:esm' : 'build:cjs',

    testEnvironment: 'node',
    testMatch: [`<rootDir>/${match}`],
    testPathIgnorePatterns: [
      '.+/__tests__/.+',
      '.+/dist/.+',

      // @hela/dev specific
      '.+/\\.config-.+$',
    ],

    haste: {
      '@tunnckocore/jest-runner-babel': {
        outDir: opts.env.NODE_ENV === 'module' ? 'dist/module' : 'dist/main',
        babel: getBabelConfig(opts),
      },
    },

    runner: '@tunnckocore/jest-runner-babel',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs', 'json'],
    rootDir: opts.cwd,
  };
}

function getBabelConfig(opts) {
  return {
    ignore: opts.env.NODE_ENV === 'test' ? [] : ['**/__tests__/**'],
    presets: [
      [
        '@babel/preset-env',
        {
          targets: { node: 8 },
          modules: opts.env.NODE_ENV === 'module' ? false : 'commonjs',
        },
      ],
      '@babel/preset-typescript',
    ],
    plugins: [
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-syntax-import-meta',
      'babel-plugin-dynamic-import-node-babel-7',
    ],
    comments: false,
  };
}
