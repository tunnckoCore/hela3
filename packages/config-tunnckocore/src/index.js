const { hela, shell } = require('@hela/core');
const dargs = require('@hela/dargs');

const cli = hela();

const lint = cli
  .command('lint')
  .describe('Lint all files from `src/` and `test/` directories')
  .action((argv) => shell(`xaxa ${dargs(argv).join(' ')}`));

const test = cli
  .command('test')
  .describe('Run tests from the `test/` directory')
  .action('node -r esm test');

module.exports = { lint, test };
