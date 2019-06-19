// import path from 'path';
import { hela, exec } from '@hela/core';

// eslint-disable-next-line import/no-duplicates
import { createAction, createBuildConfig, createLintConfig } from './support';

/**
 * Might be useful for others that uses/extend that config.
 * They will just `import { utilities } from '@hela/dev';` and done.
 */
// eslint-disable-next-line import/no-duplicates
import * as utilities from './support';

export { utilities };

const prog = hela();

export const build = prog
  .command('build', 'Build project with Babel through Jest')
  .action((argv) =>
    createAction({
      ...argv,
      projects: [
        (opts) => createBuildConfig(opts),
        (opts) => createBuildConfig({ ...opts, env: { NODE_ENV: 'module' } }),
      ],
    }),
  );

export const lint = prog
  .command('lint', 'Linting with ESLint through Jest')
  .action((argv) =>
    createAction({
      ...argv,
      type: 'lint',
      projects: [(opts) => createLintConfig(opts)],
    }),
  );

export const test = prog
  .command('test', 'Run the tests, through Jest')
  .action(function nm(argv) {
    // const testConfig = path.join(__dirname, 'configs', 'test', 'config.js');
    return exec(
      `yarn scripts jest --onlyChanged ${argv.all ? '--all' : ''} ${
        argv.watch ? '--watch' : ''
      }`,
      { env: { NODE_ENV: 'test' } },
    );
  });

export const all = prog
  .command('all', 'Runs 1) `lint`, 2) `test`, and 3) `build` command.')
  .action((argv) =>
    [lint, test, build].reduce(
      (promise, cmd) => promise.then(() => cmd(argv)),
      Promise.resolve(),
    ),
  );
