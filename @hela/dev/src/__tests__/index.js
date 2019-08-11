import { build, lint } from '..';

test('example test', () => {
  expect(typeof build.isHela).toStrictEqual('boolean');
  expect(build.isHela).toStrictEqual(true);
  expect(typeof lint.isHela).toStrictEqual('boolean');
  expect(lint.isHela).toStrictEqual(true);
});
