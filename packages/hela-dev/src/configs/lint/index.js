/* eslint-disable import/prefer-default-export */

export function createLintConfig(opts) {
  const match = opts.mono ? 'packages/*/src/**/*' : 'src/**/*';

  return {
    displayName: 'lint',

    testEnvironment: 'node',
    testMatch: [`<rootDir>/${match}`],
    testPathIgnorePatterns: [
      '.+/dist/.+',

      // @hela/dev specific
      '.+/configs/build/config\\.js$',
      '.+/configs/lint/config\\.js$',
    ],

    // TODO: include in this monorepo
    // haste: {
    //   '@tunnckocore/jest-runner-eslint': {},
    // },

    runner: 'jest-runner-eslint',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs'],
    rootDir: opts.cwd,
  };
}
