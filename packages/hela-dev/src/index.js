import fs from 'fs';
import path from 'path';

// eslint-disable-next-line no-unused-vars
import Worker from 'jest-worker';

import { hela /* exec,  toFlags */ } from '@hela/core';

/* eslint-disable import/no-duplicates */
import {
  // eslint-disable-next-line no-unused-vars
  tscGenTypes,
  runJest,
  createJestConfig,
  createBuildConfig,
  createLintConfig,
  createTestConfig,
} from './support';

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
  .option(
    '--format',
    'Pass comma-separated list like `main,module`',
    'main,module',
  )
  .option(
    '--dest',
    'Destination folder. It is appended with /main or /module, depending on format',
  )
  .option('--watch', "Trigger the Jest's --watch")
  .option('--all', 'Useful, because we pass --onlyChanged by default')
  .action(async (argv) => {
    // why it doesn't picks up the default, set in .option() ?!
    const fmt = argv.format || 'main,module';

    const { configPath, content, options } = await createJestConfig({
      ...argv,
      projects: fmt
        .split(',')
        .map((format) => (opts) =>
          createBuildConfig({ ...opts, env: { NODE_ENV: format } }),
        ),
    });

    return runJest({ configPath, content, options });
  });

export const lint = prog
  .command('lint', 'Linting with ESLint through Jest')
  .option('--watch', "Trigger the Jest's --watch")
  .option('--all', 'Useful, because we pass --onlyChanged by default')
  .action(async (argv) => {
    const { configPath, options } = await createJestConfig({
      ...argv,
      type: 'lint',
      // ! important: need to be a function, not just passing `argv`
      // ! strange but tested that it not work/behave the same, so.
      projects: [(opts) => createLintConfig(opts)],
    });

    return runJest({ configPath, options });
  });

export const test = prog
  .command('test', 'Run the tests, through Jest')
  .option('--watch', "Trigger the Jest's --watch")
  .option('--all', 'Useful, because we pass --onlyChanged by default')
  .action(async function nm(argv) {
    // const testConfig = path.join(__dirname, 'configs', 'test', 'config.js');
    const { configPath, options } = await createJestConfig({
      ...argv,
      type: 'test',
      projects: createTestConfig(argv),
    });

    return runJest({ configPath, options });

    // ? we can just do `toFlags(argv)`, but that's blocked for now by
    // ? 1) next minor/major release of `dargs`
    // ? 2) because we don't know what flags will come from other commands,
    // ? or if the command is ran manually from another script,
    // ? and jest will throw for unknow flag
    // return exec(
    //   `yarn scripts jest --onlyChanged ${argv.all ? '--all' : ''} ${
    //     argv.watch ? '--watch' : ''
    //   }`,
    //   { env: { NODE_ENV: 'test' } },
    // );
  });

export const all = prog
  .command('all', 'Runs 1) `lint`, 2) `test`, and 3) `build` command.')
  .action((argv) =>
    [lint, test, build].reduce(
      (promise, cmd) => promise.then(() => cmd(argv)),
      Promise.resolve(),
    ),
  );

export const init = prog
  .command('init [config]', 'Adds the @hela/dev config to hela')
  .action(async (cfg, argv) => {
    const pkgPath = path.join(argv.cwd, 'package.json');
    const { default: pkg } = await import(pkgPath);

    if (cfg && typeof cfg === 'string') {
      pkg.hela = cfg.startsWith('.') ? cfg : { extends: cfg };
    } else {
      pkg.hela = { extends: '@hela/dev' };
    }

    fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

    console.log('Config initialized.');

    let babelCfg = `'use strict';\n\n`;
    babelCfg += `/* eslint-disable-next-line import/no-extraneous-dependencies */\n`;
    babelCfg += `module.exports = require('@hela/dev/dist/build/main/configs/babel');\n`;

    fs.writeFileSync(path.join(argv.cwd, 'babel.config.js'), babelCfg);
    console.log('Babel config initialized.');
  });

// export const commit = prog
//   .command('commit')
//   .describe(
//     'All original `git commit` flags are available, plus 3 more - scope, body & footer',
//   )
//   .option('--gpg-sign, -S', 'GPG-sign commits', true)
//   .option(
//     '--signoff, -s',
//     'Add Signed-off-by line by the committer at the end',
//     true,
//   )
//   .option('--scope, -x', 'Prompt a question for commit scope', false)
//   .option('--body, -y', 'Prompt a question for commit body', true)
//   .option('--footer, -w', 'Prompt a question for commit footer', false)
//   .action(({ cwd, ...argv }) => {
//     const { scope, boyd, footer, signoff, S } = argv;
//     const flags = toFlags({
//       scope,
//       boyd,
//       footer,
//       signoff,
//       'gpg-sign': argv['gpg-sign'],
//     });

//     console.log(flags);

//     return exec(['git add -A', `gitcommit -s -S`]);
//   });

export const typegen = prog
  .command('typegen', 'Generate TypeScript types or copy existing to dist/')
  .option('--workspaces', 'Comma-separated list of workspace directories')
  .option(
    '--tsconfig',
    'Path to tsconfig.json file, relative to --cwd or package root',
  )
  .action(async (argv) => {
    await tscGenTypes(argv);
    // ? Seems like even in worker it's still the same timing?!
    // const worker = new Worker(require.resolve('./tsc-worker.js'), {
    //   numWorkers: 8,
    //   forkOptions: { stdio: 'inherit' },
    // });
    // await worker.default(argv);
  });
