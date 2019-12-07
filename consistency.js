/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

import fs from 'fs';
import path from 'path';
import { createAliases } from '@tunnckocore/utils';

const { info, workspaces } = createAliases(__dirname);

const ignored = ['@hela/cli'];

function consistency() {
  return workspaces
    .reduce((acc, ws) => {
      const pkgRoots = Object.keys(info)
        .filter((x) => x.startsWith(ws))
        .reduce((x, key) => x.concat(info[key]), []);

      return acc.concat(pkgRoots);
    }, [])
    .map((fp) => {
      const pkgJsonPath = path.join(fp, 'package.json');
      const pkg = require(pkgJsonPath);

      if (ignored.includes(pkg.name)) {
        return pkg;
      }

      pkg.main = './dist/cjs/index.js';
      pkg.module = './dist/esm/index.js';

      fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2));
      return pkg;
    });
}

if (process.env.SELF_CALL) {
  consistency();
}

export default consistency;
export { consistency };
