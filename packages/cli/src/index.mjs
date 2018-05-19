import fs from 'fs';
import util from 'util';
import { hela } from '@hela/core';
import findUp from 'find-file-up';

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
  const cfg = await loadConfig();

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

/**
 *
 * @returns {Promise<Object>} preset config
 */
async function loadConfig() {
  const configPath = await tryFind('hela.config');
  let configModule = null;

  try {
    configModule = await import(configPath);
  } catch (err) {
    configModule = await loadPkgConfig();
  }

  // const configModule = await import(path.join(process.cwd(), 'hela.config'));
  return Object.assign({}, configModule);
}

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

async function loadPkgConfig() {
  const pkgPath = await findUp.promise('package.json');
  const preset =
    (await util
      .promisify(fs.readFile)(pkgPath, 'utf8')
      .then(JSON.parse)
      .then((json) => json.hela && json.hela.extends)) ||
    '@hela/config-tunnckocore';

  try {
    return import(preset);
  } catch (err) {
    throw new Error(
      'hela: need a config file, hela.extends field or installed @hela/config-tunnckocore',
    );
  }
}

export default main;
