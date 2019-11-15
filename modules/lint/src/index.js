import { hela } from '@hela/core';

export const lint = hela()
  .command('lint [files]', 'Lint files using ESLint with included Prettier')
  .option('--fix', 'Fix autofixable code style errors', true)
  .action(() => {});
