import { createJestRunner } from 'create-jest-runner';

const babelRunner = createJestRunner(require.resolve('./runner'));

module.exports = babelRunner.default || babelRunner;
