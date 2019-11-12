import dargs from 'dargs';
import sade from '@hela/sade';
import dirs from 'global-dirs';
import { shell as Shell, exec as Exec } from '@tunnckocore/execa';

const globalBins = [dirs.npm.binaries, dirs.yarn.binaries];

const defaultExecaOptions = {
  stdio: 'inherit',
  env: { ...process.env },
  cwd: process.cwd(),
  concurrency: 1,
};

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

/**
 *
 * @param {object} [options]
 * @public
 */
export function hela(programName, options) {
  if (isObject(programName) && !options) {
    options = programName; // eslint-disable-line no-param-reassign
    programName = null; // eslint-disable-line no-param-reassign
  }

  const bin = typeof programName === 'string' ? programName : 'hela';
  const opts = { cwd: process.cwd(), ...options, lazy: true };
  const prog = sade(bin, opts).version(opts.version || '3.0.0');

  return Object.assign(prog, {
    isHela: true,

    /**
     * Action that will be called when command is called.
     *
     * @name hela().action
     * @param {Function} fn
     * @public
     */
    action(fn) {
      const name = this.curr || '__default__';
      const taskObj = this.tree[name];

      if (typeof fn === 'function') {
        taskObj.handler = async (...args) => {
          const argz = args.slice(0, args.length - 1);
          const fakeArgv = { ...taskObj.default, _: [name] };
          return fn.apply(this, argz.concat(fakeArgv));
        };
      }

      this.option('--cwd', 'Current working directory', opts.cwd);

      return Object.assign(taskObj.handler, this);
    },

    /**
     * Start the magic. Parse input commands and flags,
     * give them the corresponding command and its action function.
     *
     * @name hela().listen
     * @param {Function} fn
     * @public
     */
    async listen() {
      const result = prog.parse(process.argv, opts);

      if (!result || (result && !result.args && !result.name)) {
        return;
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
    },
  });
}

function isObject(val) {
  return val && typeof val === 'object' && Array.isArray(val) === false;
}
