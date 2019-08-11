'use strict';

// const proc = require('process');

// ! used for testing only
// ! keep in sync with babel config inside `src/configs/build/index.js`
const baseConfig = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: '10.13' },
        modules: 'commonjs',
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    'babel-plugin-dynamic-import-node-babel-7',
  ],
  comments: false,
};

module.exports = baseConfig;
