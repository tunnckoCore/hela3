import { hela, shell } from '@hela/core';
import dargs from '@hela/dargs';

const cli = hela();

export const lint = cli
  .command('lint')
  .describe('Lint all files from `src/` and `test/` directories')
  .action((argv) => shell(`xaxa ${dargs(argv).join(' ')}`));

export const test = cli
  .command('test')
  .describe('Run tests from the `test/` directory')
  .action('node -r esm test');
