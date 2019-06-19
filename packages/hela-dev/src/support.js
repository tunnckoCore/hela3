import fs from 'fs';
import path from 'path';
import util from 'util';
import proc from 'process';
import { exec } from '@hela/core';

export { createBuildConfig } from './configs/build';
export { createLintConfig } from './configs/lint';

export const helaDevRoot = path.dirname(__dirname);
export const helaDevNodeBins = path.join(
  helaDevRoot,
  'node_modules',
  '.bin',
  'jest',
);

export function createJestConfig(proj, opts) {
  const projects = []
    .concat(proj)
    .map((cfg) => cfg(opts))
    .filter(Boolean);

  const hash = toHash(projects);

  const content = `module.exports={projects:${JSON.stringify(projects)}};`;
  return { hash, content };
}

export function toHash(val) {
  const value = typeof val !== 'string' ? JSON.stringify(val) : val;
  return Buffer.from(value, 'base64')
    .toString('hex')
    .slice(-15, -2);
}

export function exists(fp, opts) {
  return fs.existsSync(path.join(opts.cwd, fp));
}

export async function createAction(argv) {
  const opts = Object.assign({ cwd: proc.cwd(), type: 'build' }, argv, {
    env: { NODE_ENV: 'main' },
  });

  opts.mono = exists('packages', opts) || exists('lerna.json', opts);

  const cfgMainPath = path.join(__dirname, 'configs', opts.type, '.config');
  const cfgCwdPathHash = toHash(opts.cwd);
  const cfgPath = `${cfgMainPath}-${cfgCwdPathHash}.js`;

  const { hash, content } = createJestConfig(opts.projects, opts);

  try {
    const { hash: OldHash } = createJestConfig((await import(cfgPath)).default);

    if (hash !== OldHash) {
      // fs.unlinkSync(cfgPath);
      throw new Error('fake one, to the catch');
    }
  } catch (err) {
    await util.promisify(fs.writeFile)(cfgPath, content, 'utf-8');
  }

  return exec([
    `node ${helaDevNodeBins} --version`,
    `node ${helaDevNodeBins} --config ${cfgPath}`,
  ]);
}
