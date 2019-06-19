// import proc from 'process';

// // export function createHandler({ shell, toFlags, fn, task, opts }) {
// //   return async function commandHandler(...args) {
// //     const argv = args.pop();
// //     console.log(argv);
// //     const argz = args.concat(task).concat(argv);
// //     const result = fn(...argz);

// //     if (typeof result === 'string') {
// //       return stringActionWrapper({ cmd: result, shell, toFlags, opts })(
// //         ...argz,
// //       );
// //     }

// //     // Specific & intentional case.
// //     // 1. Allows directly calling execa.shell
// //     // without passing the flags passed to hela task.
// //     // 2. Runs the commands in series.
// //     if (Array.isArray(result)) {
// //       return Promise.all(result.map((cmd) => shell(cmd, opts)));
// //     }

// //     return result;
// //   };
// // }

// export function stringActionWrapper({ shell, toFlags, cmd, opts }) {
//   return (...argz) => {
//     const [argv] = argz.slice(-1);

//     return shell(`${cmd} ${toFlags(argv, opts)}`, opts);
//   };
// }

// // export function createActionWrapper(task, name) {
// //   return function cmdAction() {
// //     // use `arguments` intentionally,
// //     // because the bad side of rest/spread operator.
// //     const args = [].slice.call(arguments); // eslint-disable-line prefer-rest-params
// //     const lens = args.length;
// //     const segs = task.usage.split(/\s+/);
// //     const reqs = segs.filter((x) => x.charAt(0) === '<');

// //     if (args.length < reqs.length) {
// //       throw new Error(`Insufficient arguments of "${name}" task`);
// //     }

// //     const argv = args.pop();
// //     const fakeArgv = Object.assign(
// //       {},
// //       task.default,
// //       lens > 1 && typeof argv === 'object' && argv,
// //       { _: [name] },
// //     );

// //     Object.keys(task.alias).forEach((key) => {
// //       task.alias[key].forEach((alias) => {
// //         fakeArgv[key] = fakeArgv[alias];
// //       });
// //     });

// //     const argz = args.concat(fakeArgv);

// //     return task.handler(...argz);
// //   };
// // }

// export function createListenMethod(prog, opts) {
//   return function listen() {
//     return new Promise((resolve, reject) => {
//       const result = prog.parse(proc.argv, opts);

//       if (!result || (result && !result.args && !result.name)) return;

//       const { args, name, handler } = result;

//       Promise.resolve()
//         .then(() => handler(...args))
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
