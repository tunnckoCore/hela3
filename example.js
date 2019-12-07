/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
/* eslint-disable strict */

'use strict';

const hela = require('./hela-cac');

const format = hela()
  .command('format [...files]', 'Format files using Prettier')
  .example(`format 'src/**/*.{js,ts,json}'`)
  .example(`fmt 'src/*.js' 'test/*.js'`)
  .alias(['fmt', 'fromat', 'foramt'])
  .action(async (files) => {
    const extensions = 'js,jsx,mjs,cjs,ts,tsx,md,mdx,json,yml,yaml';
    const globs =
      files.length > 0
        ? files.map((x) => JSON.stringify(x))
        : JSON.stringify(`**/*.{${extensions}}`);

    console.log(globs);
    // await exec(`yarn prettier ${globs} --write`, {
    //   stdio: 'inherit',
    //   cwd: process.cwd(),
    // });
  });

const lint = hela()
  .command('lint [...patterns]', 'Some linting')
  .option('--fix', 'Fix autofixable rules', { default: true })
  .example('lint src')
  .example(`lint 'src/**/*.js' --no-fix`)
  .action((patterns, options) => {
    console.log(patterns, options);
  });

const tasks = { format, lint };

const cli = hela();

Object.keys(tasks).forEach((k) => {
  const command = tasks[k].globalCommand.cli.commands[0];
  const { rawName, description, config, options, examples } = command;
  const comm = tasks[k];

  const cmd = cli.command(rawName, description, config);
  options.forEach((option) => {
    cmd.option(option.rawName, option.description, option.config);
  });
  comm.aliasNames.forEach((alias) => {
    cmd.alias(alias);
  });
  examples.forEach((example) => {
    cmd.example(example);
  });
});

// console.log(cli);

const parsed = cli.parse();

console.log(parsed);
