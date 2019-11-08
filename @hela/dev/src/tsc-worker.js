'use strict';

const path = require('path');
const esmLoader = require('esm');

// ! THIS FILE WILL BE USED FROM JEST-WORKER
module.exports = esmLoader(module)(path.join(__dirname, 'tsc.js'));