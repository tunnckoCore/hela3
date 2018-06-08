#!/usr/bin/env node

const path = require('path');
const mri = require('mri');
const arrayify = require('arrayify');
const { CLIEngine } = require('eslint');

const argv = mri(process.argv.slice(2), {
  default: {
    exit: true,
    reporter: 'codeframe',
    input: ['src', 'test'],
  },
  alias: {
    r: 'require',
    R: 'reporter',
  },
});

if (argv.require) {
  /* eslint-disable-next-line global-require, import/no-dynamic-require */
  require(argv.require);
}

const cli = new CLIEngine({
  useEslintrc: false,
  cache: true,
  reportUnusedDisableDirectives: true,
  configFile: path.join(__dirname, 'index.js'),
  extensions: ['.mjs', '.js', 'jsx'],
  ignore: argv.ignore,
});

const patterns = arrayify(argv._.length ? argv._ : argv.input).filter(Boolean);

const report = cli.executeOnFiles(patterns);
const format = cli.getFormatter(argv.reporter);

CLIEngine.outputFixes(report);

const output = argv.warnings
  ? format(report.results)
  : format(CLIEngine.getErrorResults(report.results));

console.error(output);

if (report.errorCount && !!argv.exit) {
  process.exit(1);
} else {
  process.exit(0);
}
