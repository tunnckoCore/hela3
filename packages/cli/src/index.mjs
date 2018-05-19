import { join } from 'path';
import process from 'process';
import { hela } from '@hela/core';

const cli = hela();

/**
 * Hela's CLI options and commands
 */

cli.commandless(() => cli.help());

cli.option('--show-stack', 'Show error stack trace when command fail', false);

/**
 * TODO: loading of tasks/presets/config files
 *
 * @returns {Promise}
 */
async function main() {
  const configModule = await import(join(process.cwd(), 'hela.config'));
  const preset = Object.assign({}, configModule);

  if (preset.default && typeof preset.default === 'function') {
    const meta = preset.default.getMeta();
    const taskName = meta.usage.split(' ')[0];
    preset[taskName] = preset.default;
    delete preset.default;
  }

  const tasks = Object.keys(preset).reduce((acc, name) => {
    acc[name] = preset[name].getMeta();
    return acc;
  }, {});

  cli.tree = Object.assign({}, cli.tree, tasks);
  return cli.listen();
}

export default main;
