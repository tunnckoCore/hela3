const esmLoader = require('esm');

const esmRequire = esmLoader(module);
const m = esmRequire('./index.mjs', { cjs: true });

module.exports = typeof m === 'object' && 'default' in m ? m.default : m;
