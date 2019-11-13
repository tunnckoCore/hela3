import { hela } from '@hela/core';

const prog = hela();

export const foo = prog.command('foo', 'foo bar baz').action(() => {
  console.log('Foo command!');
});

// export default prog;
