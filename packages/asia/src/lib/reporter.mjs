export default (app) => {
  const writeLine = app.options.log || console.log; // eslint-disable-line no-console

  app.before(() => {
    writeLine('TAP version 13');
  });
  app.pass((test) => {
    writeLine('# :)', test.title);
    writeLine('ok', test.index, '-', test.title);
  });
  app.fail((test) => {
    writeLine('# :(', test.title);
    writeLine('not ok', test.index, '-', test.title);

    writeLine(test.reason.message);
    // TODO: more better error handling
  });
  app.after(() => {
    writeLine('');
    writeLine(`1..${app.stats.count}`);
    writeLine('# tests', app.stats.count);
    writeLine('# pass', app.stats.pass);

    if (app.stats.fail) {
      writeLine('# fail', app.stats.fail);
      writeLine('');
    } else {
      writeLine('');
      writeLine('# ok');
    }
  });
};
