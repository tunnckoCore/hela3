import { hela, exec } from '@hela/core';

export const format = hela()
  .command('format [files]', 'Format files using Prettier')
  .example("format 'src/**/*.{js,ts,json}'")
  .alias(['fmt', 'fromat', 'foramt'])
  .action(async (files) => {
    const extensions = 'js,jsx,mjs,cjs,ts,tsx,md,mdx,json,yml,yaml';
    const globs = files || `**/*.{${extensions}}`;

    await exec(`yarn prettier ${globs} --write`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
  });
