import fs from 'fs';
import os from 'os';
import path from 'path';
import { transformFileSync } from '@babel/core';
import mkdirp from 'mkdirp';

import { pass, fail } from 'create-jest-runner';

const isWin32 = os.platform() === 'win32';

/* eslint-disable max-statements */
export default function babelRunner({ testPath, config }) {
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

  runnerConfig.outDir = runnerConfig.outDir || runnerConfig.outdir;

  if (typeof runnerConfig.outDir !== 'string') {
    runnerConfig.outDir = 'dist';
  }

  let { rootDir } = config;
  let relativePath = path.relative(rootDir, testPath);
  // const outFolder = runnerConfig.outDir;

  runnerConfig.monorepo =
    runnerConfig.monorepo || relativePath.startsWith('packages');

  // we are in monorepo environment,
  // so make dist folder in each package root
  if (runnerConfig.monorepo) {
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

  const outDir = path.resolve(rootDir, runnerConfig.outDir);
  const outFile = path.join(outDir, relativePath);

  mkdirp.sync(path.dirname(outFile));
  fs.writeFileSync(outFile, result.code);

  return pass({
    start,
    end: new Date(),
    test: { path: outFile },
  });
}
