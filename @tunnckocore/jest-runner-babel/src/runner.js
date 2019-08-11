const fs = require('fs');
const os = require('os');
const path = require('path');
const { transformFileSync } = require('@babel/core');
const { pass, fail } = require('create-jest-runner');

const isWin32 = os.platform() === 'win32';

/* eslint-disable max-statements */
module.exports = async function babelRunner({ testPath, config }) {
  const start = new Date();
  const name = '@tunnckocore/jest-runner-babel';

  const runnerConfig = Object.assign({}, config.haste[name]);
  let result = null;

  try {
    result = transformFileSync(testPath, runnerConfig.babel);
  } catch (err) {
    return fail({
      start,
      end: new Date(),
      test: { path: testPath, title: 'Babel', errorMessage: err.message },
    });
  }

  // Classic in the genre! Yes, it's possible.
  if (!result) {
    return fail({
      start,
      end: new Date(),
      test: { path: testPath, title: 'Babel', errorMessage: 'faling...' },
    });
  }

  runnerConfig.outDir = runnerConfig.outDir || runnerConfig.outdir;

  if (typeof runnerConfig.outDir !== 'string') {
    runnerConfig.outDir = 'dist';
  }

  let { rootDir } = config;
  let relativePath = path.relative(rootDir, testPath);
  // const outFolder = runnerConfig.outDir;

  // you can also use workspaces: true
  const isMono = [].concat(runnerConfig.workspaces).filter(Boolean).length > 0;

  // we are in monorepo environment,
  // so make dist folder in each package root
  if (isMono) {
    if (isWin32 && relativePath.indexOf('/') < 0) {
      relativePath = relativePath.replace(/\\/g, '/');
    }

    const segments = relativePath.split('/');
    while (segments.length > 3) segments.pop();

    rootDir = path.join(rootDir, ...segments);

    // common case
    if (rootDir.endsWith('src')) {
      relativePath = path.relative(rootDir, testPath);
      rootDir = path.dirname(rootDir);
    }
  }

  // common case
  if (relativePath.startsWith('src')) {
    relativePath = path.relative(path.join(rootDir, 'src'), testPath);
  }

  // ! important: the `rootDir` here is already a package's directory
  // ! like <monorepo root>/<workspace name>/<package dir> so we can append the dist
  let outDir = path.resolve(rootDir, runnerConfig.outDir);
  let outFile = path.join(outDir, relativePath);

  // the new dir of the new file
  outDir = path.dirname(outFile);

  const basename = path.basename(outFile, path.extname(outFile));

  outFile = path.join(outDir, `${basename}.js`);

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, result.code);

  return pass({
    start,
    end: new Date(),
    test: { path: outFile },
  });
};
