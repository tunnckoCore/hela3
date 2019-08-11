'use strict';

// ! used for testing only

/* eslint-disable-next-line import/no-extraneous-dependencies */
// module.exports = require('./@hela/dev/src/configs/babel');

module.exports = {
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
