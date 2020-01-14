/* eslint-disable max-classes-per-file, strict */

'use strict';

const dargs = require('dargs');
const dirs = require('global-dirs');
const execa = require('execa');
// const { exec: Exec } = require('@tunnckocore/execa');
const { Yaro } = require('../yaro');

const {
  deno,
  exit,
  cwd,
  parseArgv,
  processEnv,
  processArgv,
  platformInfo,
  isObject,
} = require('../shim');

const globalBins = [dirs.npm.binaries, dirs.yarn.binaries];

const defaultExecaOptions = {
  stdio: 'inherit',
  env: { ...processEnv },
  cwd: cwd(),
  concurrency: 1,
};

/**
 *
 * @param {object} argv
 * @param {object} options
 */
function toFlags(argv, options) {
  const opts = { shortFlag: true, ...options };
  return dargs(argv, opts).join(' ');
}

/**
 *
 * @param {string|string[]} cmd
 * @param {object} [options]
 * @public
 */
async function exec(cmd, options = {}) {
  const envPATH = `${processEnv.PATH}:${globalBins.join(':')}`;
  const env = { ...defaultExecaOptions.env, PATH: envPATH };

  return execa.command(cmd, { ...defaultExecaOptions, env, ...options });
  // return Exec(cmds, { ...defaultExecaOptions, env, ...options });
}

// class Hela extends Yaro {
//   constructor(programName, options) {
//     if (isObject(programName) && !options) {
//       options = programName; // eslint-disable-line no-param-reassign
//       programName = null; // eslint-disable-line no-param-reassign
//     }
//     if (options && typeof options === 'string') {
//       options = { version: options }; // eslint-disable-line no-param-reassign
//     }

//     const bin = typeof programName === 'string' ? programName : 'hela';
//     const opts = {
//       ...options,
//     };

//     super(bin, opts);
//   }

// }

/**
 *
 * @param {object} [options]
 * @public
 */
// function hela(programName, options) {
//   const prog = new Yaro(programName, options);

//   // prog.option('--cwd', 'Current working directory', prog.options.cwd);
//   // prog
//   //   .command('help [command]', 'Print more info, optionally about command')
//   //   .action((commandName) => {
//   //     prog.help(commandName);
//   //   });

//   return prog;
// }

class HelaError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'HelaError';
  }
}

class Hela extends Yaro {
  constructor(progName = 'hela', options) {
    super(progName, {
      defaultsToHelp: true,
      allowUnknownFlags: false,
      version: '3.0.0',
      ...options,
    });
    this.isHela = true;
  }
}

exports.Hela = Hela;
exports.HelaError = HelaError;
exports.hela = (...args) => new Hela(...args);
exports.exec = exec;
exports.toFlags = toFlags;
exports.default = exports.hela;

module.exports = Object.assign(exports.default, exports, {
  utils: {
    deno,
    exit,
    cwd,
    parseArgv,
    processEnv,
    processArgv,
    platformInfo,
    isObject,
  },
});
module.exports.default = module.exports;
