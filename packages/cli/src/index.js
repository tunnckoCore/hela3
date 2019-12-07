import cli from './main.js';

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
