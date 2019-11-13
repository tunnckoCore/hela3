#!/usr/bin/env node

'use strict';

const cli = require('.');

(async () => {
  try {
    await cli();
  } catch (err) {
    if (err.commandName) {
      console.error('[hela] Failed command:', err.commandName);
    }
    console.error('[hela] Failure:', err.stack);
  }
})();
