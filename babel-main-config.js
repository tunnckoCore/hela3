'use strict';

module.exports = (env) => ({
  ignore: env.NODE_ENV === 'test' ? [] : ['**/__tests__/**'],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 8 },
        modules: env.NODE_ENV === 'module' ? false : 'commonjs',
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
});
