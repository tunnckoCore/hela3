import mod from '..';

test('example test', () => {
  expect(typeof mod).toStrictEqual('function');
});

test('add 1 + 2', () => {
  expect(mod(1, 2)).toBe(103);
});
