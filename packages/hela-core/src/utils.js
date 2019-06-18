import proc from 'process';

export function createHandler({ shell, toFlags, fn, task, opts }) {
  return async function commandHandler(...args) {
    const argz = args.concat(task);
    const result = fn(...argz);

    if (typeof result === 'string') {
      return stringActionWrapper({ cmd: result, shell, toFlags, opts })(
        ...argz,
      );
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

export function stringActionWrapper({ shell, toFlags, cmd, opts }) {
  return (...args) => {
    const argv = args[args.length - 1];

    return shell(`${cmd} ${toFlags(argv, opts)}`, opts);
  };
}

export function handleChaining(cmd) {
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

export function createActionWrapper(task, name) {
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

export function createListenMethod(prog, opts) {
  return function listen() {
    return new Promise((resolve, reject) => {
      const result = prog.parse(proc.argv, opts);

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
