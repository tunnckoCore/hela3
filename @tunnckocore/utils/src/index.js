'use strict';

const fs = require('fs');
const path = require('path');

module.exports = { createAliases, getWorkspacesAndExtensions };

/* eslint-disable global-require, import/no-dynamic-require */

/**
 * Create explicit alias key/value pair from the current
 * packages inside each workspace, because
 *
 * '^(.+)': '/path/to/package/src'
 *
 * can be very big mistake ;]
 * We just don't use regex, we precompute them.
 */
function createAliases(cwd, sourceDir) {
  const { workspaces, extensions, exts } = getWorkspacesAndExtensions(cwd);
  const alias = workspaces
    .filter(Boolean)
    .reduce((acc, ws) => {
      const workspace = path.join(cwd, ws);

      const packages = fs
        .readdirSync(workspace)
        .map((dir) => {
          const pkgDir = path.join(workspace, dir);
          const pkgJsonPath = path.join(pkgDir, 'package.json');

          return { pkgDir, pkgJsonPath };
        })
        .map(({ pkgDir, pkgJsonPath }) => {
          // package specific package.json
          const pkgJson = require(pkgJsonPath);
          return [pkgDir, pkgJson];
        });

      return acc.concat(packages);
    }, [])
    .reduce((acc, [pkgDir, pkgJson]) => {
      acc[pkgJson.name] = path.join(pkgDir, sourceDir || 'src');
      return acc;
    }, {});

  return { cwd, extensions, exts, alias };
}

function getWorkspacesAndExtensions(cwd) {
  const fromRoot = (...x) => path.resolve(cwd, ...x);
  const rootPkg = require(fromRoot('package.json'));
  const rootLerna = fs.existsSync(fromRoot('lerna.json'))
    ? require(fromRoot('lerna.json'))
    : {};

  const workspaces = []
    .concat(rootLerna.packages || (rootPkg.workspaces || []))
    .filter((x) => typeof x === 'string')
    .filter(Boolean)
    .reduce((acc, ws) => acc.concat(ws.split(',')), [])
    .map((ws) => path.dirname(ws));

  let exts = [].concat(rootPkg.extensions).filter(Boolean);
  exts = exts.length > 0 ? exts : ['js', 'jsx', 'ts', 'tsx', 'mjs'];
  exts = exts.map((ext) => (ext.startsWith('.') ? ext.slice(1) : ext));

  const extensions = exts.map((x) => `.${x}`);

  return { workspaces, extensions, exts };
}
