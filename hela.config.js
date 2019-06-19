import { hela, exec, shell } from './packages/hela-core/src/index';
// const { hela, exec, shell } = require('./packages/hela-core/dist/main/index');

const prog = hela();

const bld = prog
  .command('build <src>', 'babel pipeline')
  .action(async (src, argv) => {
    console.log('building....');
    await exec([
      'sleep 4',
      `echo "sasasa build-$PWD-${src}-${argv.sasa || 'default'}"`,
    ]);
  });

export const build = bld;

export const lint = prog.command('lint', 'linting something').action(() => {
  console.log('woo lint');

  return shell('echo "foo $PWD bar"').then(() => build('foobie'));
});
