/* eslint-disable strict */

'use strict';

const { hela } = require('./src/core');

exports.foo = hela()
  .option('--this-is-something', 'ookay man')
  .option('--second', 'second global flag')
  .command('foo', 'zzz bar qux')
  .option('--bar', 'Okaaaay')
  .action((...rest) => {
    const args = rest.slice(0, -1);
    const flags = rest.slice(-1);

    console.log('args:', args);
    console.log('flags:', flags);
    console.log('foo called!');
  });

exports.lint = hela()
  .option('--some-global', 'flag here')
  .command('lint [...files]', 'Some linting', { alias: ['lnt', 'lnit'] })
  .example(`lint 'src/*.js' 'test/**/*.js' --fix`)
  .example(`lint 'zzz/**/*.js'`)
  .alias('limnt', 'lintr')
  .alias(['linting', 'lintx'])
  .option('--fix', 'Fix autofixable problems')
  .action((...rest) => {
    const argv = rest.slice(-1)[0];

    console.log('argv:', argv);
    console.log('args:', argv.args);
    console.log('flags:', argv.flags);
    console.log('lint called!');
  });
