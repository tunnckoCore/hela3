import { hela } from '@hela/core';

export const build = hela()
  .command('build', 'Build using Babel')
  .action(() => {});
