import process from 'process';
import dargs from '@hela/dargs';
import execa from 'execa-pro';
import sade from 'sade';

const defaultOptions = {
  stdio: 'inherit',
  env: process.env,
};

export function stringify(argv, options) {
  // TODO: probably
  const opts = Object.assign({ bannedFlags: ['show-stack'] }, options);

  return dargs(argv, opts).join(' ');
}

/**
 * Executes improved version of [execa][] `.shell` method.
 *
 * @param {string|string[]} cmd
 * @param {object} [opts]
 * @public
 */
export function shell(cmd, opts) {
  const options = Object.assign({}, defaultOptions, opts);
  return execa.shell(cmd, options);
}

/**
 * Executes improved version of [execa][] `.exec` method.
 *
 * @param {string|string[]} cmd
 * @param {object} [opts]
 * @public
 */
export function exec(cmd, opts) {
  const options = Object.assign({}, defaultOptions, opts);
  return execa.exec(cmd, options);
}

/**
 *
 * @param {object} [options]
 * @public
 */
export function hela(options) {
  const prog = sade('hela').version('3.0.0');
  const opts = Object.assign(defaultOptions, options, { lazy: true });

  prog.commands = {};

  return Object.assign(prog, {
    /**
     * Define some function that will be called,
     * when no commands are given.
     * Allows bypassing the `No command specified.` error,
     * instead for example show the help output.
     * https://github.com/lukeed/sade/blob/987ffa974626e281de7ff0b9eaa63acadb2a134e/lib/index.js#L128-L130
     *
     * @param {Function} fn
     */
    commandless(fn) {
      const KEY = '__default__';
      prog.default = prog.curr = KEY; // eslint-disable-line no-multi-assign
      prog.tree[KEY].usage = '';
      prog.tree[KEY].handler = async () => fn();

      return prog;
    },

    /**
     * Action that will be done when command is called.
     *
     * @param {Function} fn
     * @public
     */
    action(fn) {
      const name = prog.curr || '__default__';
      const task = prog.tree[name];

      if (typeof fn === 'function') {
        task.handler = createHandler(fn, task, opts);
      }
      if (typeof fn === 'string') {
        task.handler = stringActionWrapper(fn, opts);
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
     * @returns {Promise}
     * @public
     * @async
     */
    listen: createListenMethod(prog, opts),
  });
}

function createHandler(fn, task, opts) {
  return async function commandHandler(...args) {
    const argz = args.concat(task);
    const result = fn(...argz);

    if (typeof result === 'string') {
      return stringActionWrapper(result, opts)(...argz);
    }

    // Specific & intentional case.
    // 1. Allows directly calling execa.shell
    // without passing the flags passed to hela task.
    // 2. Runs the commands in series.
    if (Array.isArray(result)) {
      return shell(result, opts);
    }

    return result;
  };
}

function stringActionWrapper(cmd, opts) {
  return (...args) => {
    const argv = args[args.length - 1];
    const flags = `${dargs(argv).join(' ')}`;

    return shell(`${cmd} ${flags}`, opts);
  };
}

function handleChaining(cmd) {
  const task = Object.assign({}, cmd);
  task.handler.command = onChainingError;
  task.handler.describe = onChainingError;
  task.handler.option = onChainingError;
  task.handler.action = onChainingError;

  // Metadata about that specific task.
  task.handler.getMeta = () => task;
}

function onChainingError() {
  throw new Error('You cannot chain more after the `.action` call');
}

function createActionWrapper(task, name) {
  return function cmdAction() {
    // use `arguments` intentionally,
    // because the bad side of rest/spread operator.
    const args = [].slice.call(arguments); // eslint-disable-line prefer-rest-params
    const lens = args.length;
    const segs = task.usage.split(/\s+/);
    const reqs = segs.filter((x) => x.charAt(0) === '<');

    if (args.length < reqs.length) {
      throw new Error(`Insufficient arguments of "${name}" task`);
    }

    const argv = args.pop();
    const fakeArgv = Object.assign(
      {},
      task.default,
      lens > 1 && typeof argv === 'object' && argv,
      { _: [name] },
    );

    Object.keys(task.alias).forEach((key) => {
      task.alias[key].forEach((alias) => {
        fakeArgv[key] = fakeArgv[alias];
      });
    });

    const argz = args.concat(fakeArgv);

    return task.handler(...argz);
  };
}

function createListenMethod(prog, opts) {
  return function listen() {
    return new Promise((resolve, reject) => {
      const result = prog.parse(process.argv, opts);

      if (!result) return;

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
  };
}
