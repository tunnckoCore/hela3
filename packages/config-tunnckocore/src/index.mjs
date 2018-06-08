import { hela } from '@hela/core';

const cli = hela();

export const lint = cli
  .command('lint')
  .describe('Lint all files from `src/` and `test/` directories')
  .action('xaxa');

export const test = cli
  .command('test')
  .describe('Run tests from the `test/` directory')
  .action('node -r esm test');
