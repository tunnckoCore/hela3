import fs from 'fs';
import util from 'util';
import path from 'path';
import process from 'process';
import { hela } from '@hela/core';
import findUp from 'find-file-up';

function tryFind(filename, bool) {
  try {
    return findUp.promise(`${filename}.mjs`);
  } catch (err) {
    if (bool) {
      return tryFind(`${filename}.js`, true);
    }
    throw err;
  }
}

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
  const configPath = await tryFind('hela.config');

  let configModule = null;

  try {
    configModule = await import(configPath);
  } catch (err) {
    const pkgPath = await findUp.promise('package.json');
    const preset = await util
      .promisify(fs.readFile)(pkgPath, 'utf8')
      .then(JSON.parse)
      .then((json) => json.hela && json.hela.extends);

    try {
      configModule = await import(preset);
    } catch (e) {
      throw new Error('hela: need a config or `pkg.hela.extends` field');
    }
  }

  // const configModule = await import(path.join(process.cwd(), 'hela.config'));
  const cfg = Object.assign({}, configModule);

  if (cfg.default && typeof cfg.default === 'function') {
    const meta = cfg.default.getMeta();
    const taskName = meta.usage.split(' ')[0];
    cfg[taskName] = cfg.default;
    delete cfg.default;
  }

  const tasks = Object.keys(cfg).reduce((acc, name) => {
    acc[name] = cfg[name].getMeta();
    return acc;
  }, {});

  cli.tree = Object.assign({}, cli.tree, tasks);
  return cli.listen();
}

export default main;
