import Module from 'module';
import { hela } from '@hela/core';
import cosmiconfig from 'cosmiconfig';
import esmLoader from 'esm';

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
 * TODO: loading of tasks/presets/config files
 *
 * @returns {Promise}
 */
export default async function main() {
  const { config: cfg, filepath } = await explorer.search();

  if (!cfg) {
    throw new Error('hela: no config found');
  }

  console.log('hela: Loading config -> ', filepath);

  Object.keys(cfg).forEach((name) => {
    const taskValue = cfg[name];

    if (taskValue && taskValue.isHela) {
      program.tree[name] = cfg[name].tree[name];
    } else {
      console.log('hela: skipping... task should be Hela instance, for now.');
    }
  });

  return program.listen();
}
