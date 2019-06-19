import proc from 'process';
import Module from 'module';
import { hela } from '@hela/core';
import cosmiconfig from 'cosmiconfig';
import esmLoader from 'esm';

import Worker from 'jest-worker';

const explorer = cosmiconfig('hela', {
  searchPlaces: [
    `.helarc.js`,
    `hela.config.js`,
    `package.json`,
    `.helarc.json`,
    `.helarc.yaml`,
    `.helarc.yml`,
    `.helarc`,
  ],
  loaders: {
    '.js': esmLoader(new Module(), { cache: false }),
  },
});
const program = hela();

/**
 * Hela's CLI options and commands
 */

program.commandless(() => program.help());

program.option(
  '--show-stack',
  'Show error stack trace when command fail',
  false,
);

/**
 * TODO: with workers not working correctly, we even might not need them.
 *
 * @returns {Promise}
 */
export default async function main() {
  const { /*  config: cfg, */ filepath } = await explorer.search();

  const worker = new Worker(filepath, {
    numWorkers: 6,
    forkOptions: { stdio: 'inherit' },
  });

  // console.log(worker);

  const tasks = Object.keys(worker)
    .filter((key) => !key.startsWith('_'))
    .map((name) => worker[name]);

  if (tasks.length === 0) {
    throw new Error('hela: no config found');
  }

  // console.log(await tasks[0]);

  /* eslint-disable no-restricted-syntax, no-await-in-loop */
  for (const task of tasks) {
    // ! not working correctly
    const res = program.parse(proc.argv, { lazy: true });
    await task(res.args);
  }

  // console.log('sasa', proc.argv);
  // const result = program.parse(proc.argv, { lazy: true });
  // console.log('xxx', result);
  // if (!result || (result && !result.args && !result.name)) {
  //   return;
  // }
  // const { args, name, handler } = result;

  // await Promise.all(
  //   tasks.map(async (runTask) => {
  //     const prog = await runTask();

  //     console.log('prog', prog);
  //     if (prog.curr === name) {
  //       try {
  //         await handler.apply(prog, args);
  //       } catch (err) {
  //         const error = Object.assign(err, {
  //           commandArgv: args.pop(),
  //           commandArgs: args,
  //           commandName: name,
  //         });

  //         throw error;
  //       }
  //     } else {
  //     }

  //     // program.tree[prog.curr] = prog.tree[prog.curr];
  //   }),
  // );

  // return program.listen();
}
