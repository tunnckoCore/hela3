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

  const sadeMethods = Object.getOwnPropertyNames(prog)
    .concat(Object.getOwnPropertyNames(prog.__proto__)) // eslint-disable-line no-proto
    .filter((x) => x !== 'constructor');

  const app = {
    isHela: true,
    tasks: {},
  };

  sadeMethods.forEach((key) => {
    if (typeof prog[key] === 'function') {
      app[key] = prog[key].bind(app);
    } else {
      app[key] = prog[key];
    }
  });

  return Object.assign(app, {
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
      this.default = this.curr = KEY; // eslint-disable-line no-multi-assign
      this.tree[KEY].usage = '';
      this.tree[KEY].describe = '';
      this.tree[KEY].handler = async (...args) => fn(...args);

      return this;
    },

    /**
     * Action that will be called when command is called.
     *
     * @name hela().action
     * @param {Function} fn
     * @public
     */
    task(fn) {
      // const self = this;
      const name = this.curr || '__default__';
      const taskObj = this.tree[name];

      if (typeof fn === 'function') {
        taskObj.handler = async (...args) => {
          const fakeArgv = Object.assign({}, taskObj.default, { _: [name] });

          return fn.apply(this, args.concat(fakeArgv));
        };
      }

      this.tasks[name] = taskObj;

      // return 333;
      return taskObj.handler;
      // return enhance(task, this);
    },

    /**
     * Start the magic. Parse input commands and flags,
     * give them the corresponding command and its action function.
     *
     * @name hela().listen
     * @param {Function} fn
     * @public
     */
    // listen: createListen(proc, prog, opts),
  });
}

// export function createListen(processArgv, prog, options) {
//   return function listen() {
//     // ! ProTip: DO NOT USE THE `.listen()` method on the hela cli.
//     return new Promise((resolve, reject) => {
//       const result = prog.parse(processArgv, options);

//       if (!result || (result && !result.args && !result.name)) {
//         return;
//       }
//       const { args, name, handler } = result;

//       handler
//         .apply(prog, args)
//         .then(resolve)
//         .catch((err) => {
//           const error = Object.assign(err, {
//             commandArgv: args[args.length - 1],
//             commandArgs: args,
//             commandName: name,
//           });
//           reject(error);
//         });
//     });
//   };
// }

// function enhance(task, self) {
//   const returnedFunctionFromAction = async (...args) => task.handler(...args);

//   return Object.keys(self)
//     .filter((x) => typeof self[x] === 'function')
//     .reduce(
//       (acc, methodName) => {
//         acc[methodName] = onChainingError;
//         return acc;
//       },
//       Object.assign(self, {
//         isHela: true,
//         thisram: self,
//       }),
//     );
// }

// function onChainingError() {
//   throw new Error('You cannot chain more after the `.action` call');
// }
