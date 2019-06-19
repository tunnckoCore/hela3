// import { hela, exec, shell } from './packages/hela-core/src/index';
const { hela, exec, shell } = require('./packages/hela-core/dist/main/index');

const prog = hela();
// console.log(prog);

exports.build = prog
  .command('build <src>', 'babel pipeline')
  .task(async (src, argv) => {
    console.log('building....');
    await exec([
      'sleep 4',
      `echo "sasasa build-$PWD-${src}-${argv.sasa || 'default'}"`,
    ]);
  });

// exports.build = () => {
//   const res = prog
//     .command('build <src>', 'babel pipeline')
//     .action(async (src, argv) => {
//       console.log('building....');
//       await exec([
//         'sleep 4',
//         `echo "sasasa build-$PWD-${src}-${argv.sasa || 'default'}"`,
//       ]);
//     });

//   // res.fn = (...args) => res.tree[res.curr].handler(...args);
//   // console.log('duuh build command...', res);
//   console.log(res.tree[res.curr].handler.toString());
//   return 123;
//   // ! important: should return `res` !!!
//   // return res;
// };

// exports.lint = () => {
//   const res = prog.command('lint', 'linting something').action(
//     () => shell('echo "foo $PWD bar"') /* .then(() => build('foobie')) */,
//     // console.log('woo lint');
//   );

//   // console.log('lint res', res);
//   return prog;
// };

// export default function myConfig() {
//   return hela()
//     .command('build <src>', 'babel pipeline')
//     .action(async (src, argv) => {
//       console.log('building....');
//       await exec([
//         'sleep 4',
//         `echo "sasasa build-$PWD-${src}-${argv.sasa || 'default'}"`,
//       ]);
//     })

//     .command('lint', 'linting something')
//     .action(
//       () => shell('echo "foo $PWD bar"').then(() => build('foobie')),
//       // console.log('woo lint');
//     );
// }

// const tasks = myConfig().tree;

// export const { build } = tasks;
// export const { lint } = tasks;
