import { hela } from '@hela/core';

export const format = hela()
  .command('format [files]', 'Format files using Prettier')
  .alias(['fmt', 'fromat', 'foramt'])
  .action(() => {});
