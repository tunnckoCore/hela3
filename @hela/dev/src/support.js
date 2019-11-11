import fs from 'fs';
import path from 'path';
import util from 'util';
import proc from 'process';
import { exec } from '@hela/core';
import { getWorkspacesAndExtensions } from '@tunnckocore/utils';

export { createBuildConfig } from './configs/build';
export { createLintConfig } from './configs/lint';
export { createTestConfig } from './configs/test';

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
  const options = {
    cwd: proc.cwd(),
    type: 'build',
    ...argv,
    env: { NODE_ENV: 'main' },
  };

  options.mono = exists('packages', options) || exists('lerna.json', options);

  const cfgPath = path.join(__dirname, 'configs', options.type, 'config.js');
  const content = createJestConfigContent(options.projects, options);

  await util.promisify(fs.writeFile)(cfgPath, content, 'utf-8');

  return { configPath: cfgPath, content, options };
}

export function runJest({ configPath, options = {} }) {
  return exec([
    `yarn scripts jest --version`,
    `yarn scripts jest --onlyChanged --config ${configPath} ${
      options.watch ? '--watch' : ''
    } ${options.all ? '--all' : ''}`,
  ]);
}

export async function tscGenTypesForPackage(argv) {
  const fromCwd = (...x) => path.resolve(argv.cwd, ...x);

  // TODO: reconsider
  const tsConfigPath = fromCwd(argv.tsconfig || 'tsconfig.json');

  const typesDist = fromCwd('dist', 'types');
  const outFile = fromCwd(typesDist, 'index.d.ts');

  if (fs.existsSync(fromCwd('index.d.ts'))) {
    fs.mkdirSync(typesDist, { recursive: true });
    fs.copyFileSync(fromCwd('index.d.ts'), outFile);
    return;
  }
  if (fs.existsSync(fromCwd('src', 'index.d.ts'))) {
    fs.mkdirSync(typesDist, { recursive: true });
    fs.copyFileSync(fromCwd('src', 'index.d.ts'), outFile);
    return;
  }

  const hasTypeScriptFiles = [fromCwd('src', 'index.ts'), fromCwd('index.ts')]
    .map((x) => fs.existsSync(x))
    .filter(Boolean);

  if (hasTypeScriptFiles.length > 0 && fs.existsSync(tsConfigPath)) {
    const flags = [
      '-d',
      '--emitDeclarationOnly',
      '--declarationMap',
      'false',
      '--project',
      tsConfigPath,
      '--declarationDir',
      typesDist,
    ];

    await exec(`yarn scripts tsc ${flags.join(' ')}`);
  }
}

export async function tscGenTypes(argv) {
  const fromRoot = (...x) => path.resolve(argv.cwd, ...x);
  // // ! TODO: should do the same part for theother commands too, so externalize
  // const rootPkg = await import(fromRoot('package.json'));
  // const rootLerna = fs.existsSync(fromRoot('lerna.json'))
  //   ? await import(fromRoot('lerna.json'))
  //   : {};

  // const workspaces = []
  //   .concat(
  //     rootLerna.packages ||
  //       (rootPkg.workspaces ? rootPkg.workspaces : argv.workspaces),
  //   )
  //   .filter((x) => typeof x === 'string')
  //   .filter(Boolean)
  //   .reduce((acc, ws) => acc.concat(ws.split(',')), [])
  //   .map((ws) => path.dirname(ws));
  // // ! TODO: end of todo
  const { workspaces } = getWorkspacesAndExtensions(argv.cwd);

  if (workspaces.length > 0) {
    const { cwd, ...opts } = argv;

    return Promise.all(
      workspaces.map(async (ws) => {
        const wsDir = fromRoot(ws);
        const pkgsInWorkspace = await util.promisify(fs.readdir)(wsDir);

        return Promise.all(
          pkgsInWorkspace.map(async (pkgDir) => {
            const pkgRoot = path.join(wsDir, pkgDir);
            const options = { ...opts, cwd: pkgRoot };

            await tscGenTypesForPackage(options);
          }),
        );
      }),
    );
  }

  return tscGenTypesForPackage(argv);
}
