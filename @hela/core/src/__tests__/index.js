import { hela, shell, exec, toFlags } from '..';

test('example test', () => {
  expect(typeof hela).toStrictEqual('function');
  expect(typeof shell).toStrictEqual('function');
  expect(typeof exec).toStrictEqual('function');
  expect(typeof toFlags).toStrictEqual('function');
});
