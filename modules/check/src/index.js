import { hela } from '@hela/core';

export const check = hela()
  .command('check', 'Check code style and format')
  .action(() => {});
