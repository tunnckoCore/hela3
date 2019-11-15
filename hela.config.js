import { hela } from '@hela/core';

export * from '@hela/dev';

const prog = hela();

export const foo = prog
  .command('foo', 'foo bar baz')
  .option('--bar', 'Okaaaay')
  .action(() => {
    console.log('Foo command!');
  });
