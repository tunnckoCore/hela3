const fs = require('fs');
const path = require('path');
const util = require('util');
const { hela } = require('@hela/core');
const findUp = require('find-file-up');

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
    // eslint-disable-next-line import/no-dynamic-require, global-require
    configModule = await Promise.resolve(require(configPath));
  } catch (err) {
    configModule = await loadPkgConfig();
  }

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
  const isDefault = (val) => val === '@hela/config-tunnckocore';
  const pkgPath = await findUp.promise('package.json');

  let preset =
    (await util
      .promisify(fs.readFile)(pkgPath, 'utf8')
      .then(JSON.parse)
      .then((json) => json.hela && json.hela.extends)) ||
    '@hela/config-tunnckocore';

  let cfg = null;

  if (!isDefault(preset) && /\.m?js/.test(preset)) {
    preset = path.join(path.dirname(pkgPath), preset);
  }

  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    cfg = await require(preset);
  } catch (err) {
    throw new Error(
      'hela: need a config file, hela.extends field or installed @hela/config-tunnckocore',
    );
  }

  return cfg;
}

module.exports = main;
