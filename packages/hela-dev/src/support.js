import fs from 'fs';
import path from 'path';
import util from 'util';
import proc from 'process';
import { exec } from '@hela/core';

export { createBuildConfig } from './configs/build';
export { createLintConfig } from './configs/lint';

export function createJestConfig(proj, opts) {
  const projects = []
    .concat(proj)
    .map((cfg) => (typeof cfg === 'function' ? cfg(opts) : cfg))
    .filter(Boolean);

  return `module.exports={projects:${JSON.stringify(projects)}};`;
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

  const cfgPath = path.join(__dirname, 'configs', opts.type, 'config.js');
  const content = createJestConfig(opts.projects, opts);

  await util.promisify(fs.writeFile)(cfgPath, content, 'utf-8');

  return exec([
    `yarn scripts jest --version`,
    `yarn scripts jest --onlyChanged --config ${cfgPath} ${
      opts.watch ? '--watch' : ''
    }`,
  ]);
}
