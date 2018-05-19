/* eslint-disable import/prefer-default-export */
import { hela } from '@hela/core';

const cli = hela();

export const test = cli
  .command('test')
  .describe('testing all packages')
  .action(() => {
    console.log('woohooo!!');
  });
