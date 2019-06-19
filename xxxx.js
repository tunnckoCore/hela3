// import { hela, exec, shell } from '@hela/core';
// // const { hela, exec, shell } = require('./packages/hela-core/dist/main/index');

// // export default {
// //   cwd: 'ssa',
// // };

// const prog = hela();

// const bld = prog
//   .command('build <src>', 'babel pipeline')
//   .action(async (src, argv) => {
//     console.log('building....');
//     await exec([
//       'sleep 4',
//       `echo "sasasa build-$PWD-${src}-${argv.sasa || 'default'}"`,
//     ]);
//   });

// export const build = bld;

// export const lint = prog.command('lint', 'linting something').action((argv) => {
//   console.log('woo lint');

//   return shell('echo "foo $PWD bar"').then(() => build('foobie', argv));
// });

export default './packages/hela-dev/src/index.js';
