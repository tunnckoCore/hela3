/* eslint-disable import/prefer-default-export */
import { hela } from '@hela/core';

const cli = hela();

export const lint = cli
  .command('lint')
  .describe('Lint all `.mjs` files from `src/` and `test/` directories')
  .action('eslint src test -f codeframe --ext .mjs --quiet --fix --cache');

export const test = cli
  .command('test')
  .describe('Run tests from the `test/` directory')
  .action('node -r esm test');
