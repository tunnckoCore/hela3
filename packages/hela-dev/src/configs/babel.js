'use strict';

const proc = require('process');

// ! keep in sync with babel config inside `src/configs/build/index.js`
module.exports = {
  ignore: proc.env.NODE_ENV === 'test' ? [] : ['**/__tests__/**'],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: '8.9' },
        modules: proc.env.NODE_ENV === 'module' ? false : 'commonjs',
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    'babel-plugin-dynamic-import-node-babel-7',
  ],
  comments: false,
};
