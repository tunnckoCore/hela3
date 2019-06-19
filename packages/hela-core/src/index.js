import proc from 'process';
import dargs from 'dargs';
import execa from 'execa';
import sade from 'sade';

// import {
//   createHandler,
//   createActionWrapper,
//   createListenMethod,
//   stringActionWrapper,
//   enhance,
// } from './utils';

const defaultOptions = {
  stdio: 'inherit',
  env: proc.env,
};

/**
 *
 * @param {object} argv
 * @param {object} options
 */
export function toFlags(argv, options) {
  const opts = Object.assign({ allowSingleFlags: true }, options);
  return dargs(argv, opts).join(' ');
}

/**
 *
 * @param {string|string[]} cmds
 * @param {object} [options]
 * @public
 */
export function shell(cmds, options) {
  return exec(cmds, Object.assign({}, options, { shell: true }));
}

/**
 *
 * @param {string|string[]} cmd
 * @param {object} [options]
 * @public
 */
export async function exec(cmds, options) {
  const commands = [].concat(cmds).filter(Boolean);
  const opts = Object.assign({}, defaultOptions, options);

  /* eslint-disable no-restricted-syntax, no-await-in-loop */
  for (const cmd of commands) {
    await execa.command(cmd, opts);
  }
}

/**
 *
 * @param {object} [options]
 * @public
 */
export function hela(options) {
  const prog = sade('hela').version('3.0.0');
  const opts = Object.assign({}, defaultOptions, options, { lazy: true });

  prog.commands = {};

  const app = Object.assign(prog, {
    /**
     * Define some function that will be called,
     * when no commands are given.
     * Allows bypassing the `No command specified.` error,
     * instead for example show the help output.
     * https://github.com/lukeed/sade/blob/987ffa974626e281de7ff0b9eaa63acadb2a134e/lib/index.js#L128-L130
     *
     * @name hela().commandless
     * @param {Function} fn
     * @public
     */
    commandless(fn) {
      const KEY = '__default__';
      prog.default = prog.curr = KEY; // eslint-disable-line no-multi-assign
      prog.tree[KEY].usage = '';
      prog.tree[KEY].describe = '';
      prog.tree[KEY].handler = async (...args) => fn(...args);

      return prog;
    },

    /**
     * Action that will be called when command is called.
     *
     * @name hela().action
     * @param {Function} fn
     * @public
     */
    action(fn) {
      // const self = this;
      const name = prog.curr || '__default__';
      const task = prog.tree[name];

      if (typeof fn === 'function') {
        task.handler = async (...args) => {
          const fakeArgv = Object.assign({}, task.default, { _: [name] });

          return fn(...args.concat(fakeArgv));
        };
      }

      return enhance(task, this);
    },

    /**
     * Start the magic. Parse input commands and flags,
     * give them the corresponding command and its action function.
     *
     * @name hela().listen
     * @param {Function} fn
     * @public
     */
    listen() {
      return new Promise((resolve, reject) => {
        const result = prog.parse(proc.argv, opts);

        if (!result || (result && !result.args && !result.name)) {
          return;
        }
        const { args, name, handler } = result;

        handler(...args)
          .then(resolve)
          .catch((err) => {
            const error = Object.assign(err, {
              commandArgv: args[args.length - 1],
              commandArgs: args,
              commandName: name,
            });
            reject(error);
          });
      });
    },
  });

  return app;
}

function enhance(task, self) {
  const returnedFunctionFromAction = async (...args) => task.handler(...args);

  return Object.keys(self)
    .filter((x) => typeof self[x] === 'function')
    .reduce(
      (acc, methodName) => {
        acc[methodName] = onChainingError;
        return acc;
      },
      Object.assign(returnedFunctionFromAction, task, {
        isHela: true,
        program: self,
      }),
    );
}

function onChainingError() {
  throw new Error('You cannot chain more after the `.action` call');
}
