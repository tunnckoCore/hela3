import path from 'path';
import esmLoader from 'esm';
import { prettyConfig } from '@tunnckocore/pretty-config';
import { hela, HelaError, utils } from '@hela/core';

const CWD = process.cwd();
const esmRequire = esmLoader(module);

// const explorer = cosmiconfigSync('hela', {
//   searchPlaces: [
//     // '.helarc.js',
//     // '.helarc.ts',
//     'hela.config.js',
//     // 'hela.config.ts',
//     // 'package.json',
//     // '.helarc.json',
//     // '.helarc',
//   ],
//   // loaders: {
//   //   '.js': esmRequire,
//   // },
// });

const prog = hela();

export default async function main() {
  const cfg = await prettyConfig('hela', { cwd: CWD });

  if (!cfg || (cfg && !cfg.config)) {
    throw new HelaError('No config or preset found');
  }

  const config =
    cfg.filepath.endsWith('.json') || cfg.filepath.endsWith('.helarc')
      ? fromJson(cfg.config)
      : cfg.config;

  console.log(
    '[info] hela: Loading config ->',
    path.relative(CWD, cfg.filepath),
  );

  if (!isValidConfig(config)) {
    throw new HelaError('No config found or invalid');
  }

  // if (config.default && config.default.isHela) {
  //   prog.tree = config.default.tree;

  //   return prog.listen();
  // }

  const tasks = Object.keys(config);
  // const name = tasks[tasks.length - 1];
  // const state = config[name];

  // console.log(tasks);

  const extendedProgram = tasks.reduce((acc, name) => {
    const cmd = utils.getCmd(config[name].tree, name);
    const command = cmd.handler.curr;

    acc.tree[command] = cmd;
    acc.commandAliases[command] = cmd.handler.commandAliases[command];

    return acc;
  }, prog);

  return Object.assign(prog, extendedProgram).listen();
}

function fromJson(config) {
  if (typeof config === 'string') {
    if (config.length === 0) {
      throw new HelaError(
        'The "hela" field can only be object or non-empty string',
      );
    }

    return esmRequire(path.join(CWD, config));
  }
  if (config && typeof config === 'object') {
    if (config.cwd) {
      if (!config.extends) {
        throw new HelaError(
          'When defining "cwd" option, you need to pass `extends` too.',
        );
      }

      return esmRequire(path.join(config.cwd, config.extends));
    }

    return esmRequire(config.extends);
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
