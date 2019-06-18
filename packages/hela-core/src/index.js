import proc from 'process';
import dargs from 'dargs';
import execa from 'execa';
import sade from 'sade';

import {
  createHandler,
  createActionWrapper,
  createListenMethod,
  stringActionWrapper,
  handleChaining,
} from './utils';

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
 * @param {string|string[]} cmd
 * @param {object} [options]
 * @public
 */
export function shell(cmd, options) {
  return exec(cmd, Object.assign({}, options, { shell: true }));
}

/**
 *
 * @param {string|string[]} cmd
 * @param {object} [options]
 * @public
 */
export function exec(cmd, options) {
  const opts = Object.assign({}, defaultOptions, options);
  return execa.command(cmd, opts);
}

/**
 *
 * @param {object} [options]
 * @public
 */
export function hela(options) {
  const prog = sade('hela').version('3.0.0');
  const opts = Object.assign({}, defaultOptions, options, {});

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
      prog.tree[KEY].handler = async () => fn();

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
      const name = prog.curr || '__default__';
      const task = prog.tree[name];

      if (typeof fn === 'function') {
        task.handler = createHandler({ shell, toFlags, fn, task, opts });
      }
      if (typeof fn === 'string') {
        task.handler = stringActionWrapper({ shell, toFlags, cmd: fn, opts });
      }
      if (Array.isArray(fn)) {
        fn.forEach((func) => {
          prog.action(func);
        });
      }

      handleChaining(task);

      prog.commands[name] = createActionWrapper(task, name);

      return task.handler;
    },

    /**
     * Start the magic. Parse input commands and flags,
     * give them the corresponding command and its action function.
     *
     * @name hela().listen
     * @param {Function} fn
     * @public
     */
    listen: createListenMethod(prog, opts),
  });

  app.isHela = Boolean(
    app.commands && app.commandless && app.listen && app.action && app.help,
  );

  return app;
}
