/* eslint-disable unicorn/no-process-exit */
/* eslint-disable no-undef */
/* eslint-disable strict */

'use strict';

const mri = require('mri');

const deno = typeof window !== 'undefined' && window.Deno;
exports.deno = deno;
exports.exit = (code) => (deno ? deno.exit(code) : process.exit(code));
exports.cwd = deno ? deno.cwd : process.cwd;
exports.parseArgv = deno ? () => {} : mri;
exports.processEnv = deno ? deno.env : process.env;
// as of mid Janruary, deno has changed deno.args; todo: update here
exports.processArgv = deno ? ['x', 'deno'].concat(deno.args) : process.argv;
exports.platformInfo = deno
  ? `${Deno.platform.os}-${deno.platform.arch} deno-${deno.version.deno}`
  : `${process.platform}-${process.arch} node-${process.version}`;

exports.isObject = function isObject(val) {
  return val && typeof val === 'object' && Array.isArray(val) === false;
};
