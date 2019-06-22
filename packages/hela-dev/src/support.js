import fs from 'fs';
import path from 'path';
import util from 'util';
import proc from 'process';
import { exec } from '@hela/core';

export { createBuildConfig } from './configs/build';
export { createLintConfig } from './configs/lint';

export function createJestConfigContent(proj, opts) {
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

export async function createJestConfig(argv) {
  const options = Object.assign({ cwd: proc.cwd(), type: 'build' }, argv, {
    env: { NODE_ENV: 'main' },
  });

  options.mono = exists('packages', options) || exists('lerna.json', options);

  const cfgPath = path.join(__dirname, 'configs', options.type, 'config.js');
  const content = createJestConfigContent(options.projects, options);

  await util.promisify(fs.writeFile)(cfgPath, content, 'utf-8');

  return { filepath: cfgPath, content, options };
}

export function runJest({ filepath, options = {} }) {
  return exec([
    `yarn scripts jest --version`,
    `yarn scripts jest --onlyChanged --config ${filepath} ${
      options.watch ? '--watch' : ''
    } ${options.all ? '--all' : ''}`,
  ]);
}
