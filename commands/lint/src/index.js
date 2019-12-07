import { hela, exec } from '@hela/core';

export const lint = hela()
  .command('lint [files]', 'Lint files using ESLint with included Prettier')
  .alias(['lnt', 'lnit', 'ilnt', 'limnt'])
  // ! todo: does not add "files" as first argument to action
  // .option('--fix', 'Fix autofixable code style errors', true)
  .action(async (files) => {
    const exts = 'js,jsx,mjs,cjs,ts,tsx,md';
    const globs = files || `**/{commands,packages,presets}/**/*.{${exts}}`;

    await exec(
      `yarn eslint ${globs} --fix --quiet --cache --format codeframe`,
      {
        stdio: 'inherit',
        cwd: process.cwd(),
      },
    );
  });
