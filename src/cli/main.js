/* eslint-disable unicorn/no-process-exit */
/* eslint-disable node/no-unsupported-features/node-builtins */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable strict */

'use strict';

const fs = require('fs');
const path = require('path');
const { hela, HelaError } = require('../core');
const utils = require('../shim');

const CWD = utils.cwd();

const prog = hela();

prog
  .option('--cwd', 'some global flag')
  .example('bar -ptv')
  .example('lint src --cache');

module.exports = async function main() {
  const cfg = await getConfig('hela', { cwd: CWD });

  if (!cfg || (cfg && !cfg.config)) {
    throw new HelaError('No config or preset found');
  }

  const config = cfg.filepath.endsWith('.json')
    ? fromJson(cfg.config)
    : cfg.config;

  console.log(
    '[info] hela: Loading config ->',
    path.relative(CWD, cfg.filepath),
  );

  if (!isValidConfig(config)) {
    throw new HelaError('No config found or invalid');
  }

  prog.extendWith(config);

  return prog.parse();
};

function fromJson(config) {
  if (typeof config === 'string') {
    if (config.length === 0) {
      throw new HelaError(
        'The "hela" field can only be object or non-empty string',
      );
    }

    return require(path.join(CWD, config));
  }
  if (config && typeof config === 'object') {
    if (config.cwd) {
      if (!config.extends) {
        throw new HelaError(
          'When defining "cwd" option, you need to pass `extends` too.',
        );
      }

      return require(path.join(config.cwd, config.extends));
    }

    return require(config.extends);
  }

  throw new HelaError('Config can only be object or non-empty string');
}

function isValidConfig(val) {
  if (!val) return false;
  if (utils.isObject(val)) {
    return true;
  }
  return false;
}

async function getConfig(name, { cwd } = {}) {
  let cfg = await getPkg(cwd);

  if (!cfg) {
    const filepath = path.join(cwd, 'hela.config.js');
    const config = require(filepath);
    cfg = { config, filepath };
  }

  return cfg;
}

async function getPkg(cwd) {
  let pkg = null;
  const filepath = path.join(cwd, 'package.json');

  try {
    pkg = JSON.parse(await fs.promises.readFile(filepath, 'utf8'));
  } catch (err) {
    return null;
  }

  return pkg.hela ? { config: pkg.hela, filepath } : null;
}
