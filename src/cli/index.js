#!/usr/bin/env node

/* eslint-disable strict */

'use strict';

const cli = require('./main');

(async function runHelaCli() {
  try {
    await cli();
  } catch (err) {
    console.error('[hela] Failure:', err.stack);
  }
})();
