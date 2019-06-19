#!/usr/bin/env node

'use strict';

import proc from 'process';
import main from './index';

main()
  .then(() => {
    proc.exit(0);
  })
  .catch((err) => {
    if (err.commandName) {
      console.error('Failed command:', err.commandName);
    }

    // ! TODO: remove
    console.log(err);

    if (err.commandArgv && err.commandArgv['show-stack']) {
      console.error('Error stack:', err.stack);
    } else {
      console.error(`${err.name}:`, err.message);
    }

    proc.exit(1);
  });
