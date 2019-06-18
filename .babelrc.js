'use strict';

module.exports = {
  ignore: ['**/__tests__/**'],
  presets: [
    ['@babel/preset-env', { targets: { node: 8 } }],
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    'babel-plugin-dynamic-import-node-babel-7',
  ],
  comments: false,
};
