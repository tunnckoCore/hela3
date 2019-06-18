'use strict';

const createBuildConfig = require('./build.config');
// const lintConfig = require('./jest-lint.config');

module.exports = {
  projects: [
    createBuildConfig({ NODE_ENV: 'main' }),
    createBuildConfig({ NODE_ENV: 'module' }),
  ],
};
