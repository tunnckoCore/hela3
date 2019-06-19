import path from 'path';
import proc from 'process';
import Module from 'module';
import { hela } from '@hela/core';
import cosmiconfig from 'cosmiconfig';
import esmLoader from 'esm';

const mod = new Module();
const esmRequire = esmLoader(mod);

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
    '.js': esmRequire,
  },
});

const program = hela();

/**
 * Hela's CLI options and commands
 */

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
  const res = await explorer.search();

  if (!res.config) {
    throw new Error('hela: no config found');
  }

  const config = res.filepath.endsWith('package.json')
    ? fromJson(res)
    : fromJS(res);

  console.log('hela: Loading config -> ', res.filepath);

  const tasksKeys = Object.keys(config);

  tasksKeys
    .filter((x) => x !== 'cwd')
    .forEach((name) => {
      const taskValue = config[name];

      if (taskValue && taskValue.isHela) {
        program.tree[name] = taskValue.tree[name];
      } else {
        console.log('hela: skipping... task should be Hela instance, for now.');
      }
    });

  return program.listen();
}

/**
 *
 * TODO: 1) better config validation
 * TODO: 2) presets (e.g. 'extends') recursive loading & merging??
 * TODO: --- Might not be needed, because configs are already pretty flexible and composoable.
 */

function fromJson({ config }) {
  if (typeof config === 'string') {
    if (config.length === 0) {
      throw new Error('hela: field can only be object or non-empty string');
    }

    // ? If you want to resolve relative config,
    // ? then use `"hela": "./path-to-my-config.js"`
    return esmRequire(path.join(proc.cwd(), config));
  }
  if (config && typeof config === 'object') {
    // ? If you pass `{ "hela": {"cwd": "../foo", "extends": "bar" } }`
    // ? it will resolve ../foo/bar.js, not the npm module `bar`.
    if (config.cwd) {
      if (!config.extends) {
        throw new Error(
          'hela: when defining `cwd` option, you need to pas `extends` too',
        );
      }
      return esmRequire(path.join(config.cwd, config.extends));
    }

    // ? If you want to load a package module config use extends.
    return esmRequire(config.extends);
  }

  throw new Error('hela: config can only be object or string');
}

function fromJS({ config }) {
  if (config.default) {
    console.log(
      'hela warn: will use the default export for the preset loading mechanism',
    );
    return fromJson({ config: config.default });
  }

  return config;
}
