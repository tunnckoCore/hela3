/* eslint-disable max-classes-per-file */
import dargs from 'dargs';
import dirs from 'global-dirs';
import { Sade, SadeError } from '@hela/sade';
import { shell as Shell, exec as Exec } from '@tunnckocore/execa';

const globalBins = [dirs.npm.binaries, dirs.yarn.binaries];

const defaultExecaOptions = {
  stdio: 'inherit',
  env: { ...process.env },
  cwd: process.cwd(),
  concurrency: 1,
};

export class HelaError extends SadeError {
  constructor(msg) {
    super(msg);
    this.name = 'HelaError';
  }
}

/**
 *
 * @param {object} argv
 * @param {object} options
 */
export function toFlags(argv, options) {
  const opts = { shortFlag: true, ...options };
  return dargs(argv, opts).join(' ');
}

/**
 *
 * @param {string|string[]} cmds
 * @param {object} [options]
 * @public
 */
export function shell(cmds, options) {
  const envPATH = `${process.env.PATH}:${globalBins.join(':')}`;
  const env = { ...defaultExecaOptions.env, PATH: envPATH };

  return Shell(cmds, { ...defaultExecaOptions, env, ...options });
}

/**
 *
 * @param {string|string[]} cmd
 * @param {object} [options]
 * @public
 */
export function exec(cmds, options = {}) {
  const envPATH = `${process.env.PATH}:${globalBins.join(':')}`;
  const env = { ...defaultExecaOptions.env, PATH: envPATH };

  return Exec(cmds, { ...defaultExecaOptions, env, ...options });
}

export class Hela extends Sade {
  constructor(programName, options) {
    if (isObject(programName) && !options) {
      options = programName; // eslint-disable-line no-param-reassign
      programName = null; // eslint-disable-line no-param-reassign
    }
    if (options && typeof options === 'string') {
      options = { version: options }; // eslint-disable-line no-param-reassign
    }

    const bin = typeof programName === 'string' ? programName : 'hela';
    const opts = {
      cwd: process.cwd(),
      version: '3.0.0',
      singleMode: false,
      // defaultCommand: 'help',
      ...options,
      lazy: true,
    };

    super(bin, opts);

    this.options = opts;
    this.isHela = true;
  }

  action(fn) {
    const name = this.curr || '__default__';
    const task = this.tree[name];

    if (typeof fn === 'function') {
      task.handler = async (...args) => {
        const argz = args.slice(0, args.length - 1);
        const fakeArgv = { ...task.default, _: [name] };
        return fn.apply(this, argz.concat(fakeArgv));
      };
    } else {
      console.log('[warn] hela: no action function passed!');
      // TODO(@tunnckoCore): error or somthing...
    }

    return Object.assign(task.handler, this);
  }

  /**
   * Start the magic. Parse input commands and flags,
   * give them the corresponding command and its action function.
   *
   * @name hela().listen
   * @param {Function} fn
   * @public
   */
  async listen() {
    const result = this.parse(process.argv, this.options);
    // console.log(result);

    if (!result || (result && !result.args && !result.name)) {
      return this;
    }
    const { args, name, handler } = result;

    try {
      await handler.apply(this, args);
    } catch (err) {
      const error = Object.assign(err, {
        commandArgv: args.pop(),
        commandArgs: args,
        commandName: name,
      });
      throw error;
    }

    return this;
  }
}

/**
 *
 * @param {object} [options]
 * @public
 */
export function hela(programName, options) {
  const prog = new Hela(programName, options);

  // prog.option('--cwd', 'Current working directory', prog.options.cwd);
  prog.command('help', 'Print more information').action((commandName) => {
    prog.help(commandName);
  });

  return prog;
}

export function isObject(val) {
  return val && typeof val === 'object' && Array.isArray(val) === false;
}
