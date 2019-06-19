import fs from 'fs';
import path from 'path';
import util from 'util';
import proc from 'process';
import { hela, exec } from '@hela/core';

import createBuildConfig from './configs/build';
// import createLintConfig from './configs/lint';

import {} from './support';

const prog = hela();

function createJestConfig(...args) {
  const projects = [].concat(args).filter(Boolean);
  const hash = toHash(projects);

  const content = `module.exports={projects:${JSON.stringify(projects)}};`;
  return { hash, content };
}

function toHash(val) {
  const value = typeof val !== 'string' ? JSON.stringify(val) : val;
  return Buffer.from(value, 'base64')
    .toString('hex')
    .slice(-15, -2);
}

function exists(fp, opts) {
  return fs.existsSync(path.join(opts.cwd, fp));
}

/**
 * Build command, uses Babel through Jest, to compile the code.
 */
export const build = prog
  .command('build', 'Build project with Babel using Jest')
  .action(async (argv) => {
    const opts = Object.assign({ cwd: proc.cwd() }, argv, {
      env: { NODE_ENV: 'main' },
    });

    opts.mono = exists('packages', opts) || exists('lerna.json', opts);

    const helaDevRoot = path.dirname(__dirname);
    const helaNodeBins = path.join(helaDevRoot, 'node_modules', '.bin', 'jest');

    const cfgMainPath = path.join(__dirname, 'configs', 'build', '.config');
    const cfgCwdPathHash = toHash(opts.cwd);
    const cfgPath = `${cfgMainPath}-${cfgCwdPathHash}.js`;

    const { hash, content } = createJestConfig(
      createBuildConfig(opts),
      createBuildConfig({ ...opts, env: { NODE_ENV: 'module' } }),
    );

    try {
      const { hash: OldHash } = createJestConfig(
        (await import(cfgPath)).default,
      );

      if (hash !== OldHash) {
        fs.unlinkSync(cfgPath);
        throw new Error('fake one, to the catch');
      }
    } catch (err) {
      await util.promisify(fs.writeFile)(cfgPath, content, 'utf-8');
    }

    return exec([
      `node ${helaNodeBins} --version`,
      `node ${helaNodeBins} --config ${cfgPath}`,
    ]);
  });

export const foo = prog.command('foo').action(() => {});
// export const test = 'NODE_ENV=test jest';
// export const lint = 'jest --config jest-lint.config.js';
// export const build2 = 'jest --config jest-build.config.js';
