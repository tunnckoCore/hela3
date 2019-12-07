import path from 'path';

import { consistency } from './consistency.js';

const externals = consistency().reduce(
  (acc, { dependencies }) => acc.concat(Object.keys(dependencies)),
  [],
);

const external = [...new Set(externals)];

const tunnckocoreInterop = `const ___exportsWithoutDefault = Object.keys(exports)
  .filter((x) => x !== 'default')
  .reduce((acc, key) => {
    acc[key] = exports[key];
    return acc;
  }, {});
module.exports = Object.assign(exports.default || {}, ___exportsWithoutDefault);
`;

const config = {
  // onwarn: () => {},
  external,
  inlineDynamicImports: true,
  experimentalTopLevelAwait: true,
  input: path.join(process.env.PKG_PATH, 'src/index.js'),
  output: [
    {
      file: path.join(process.env.PKG_PATH, 'dist/cjs/index.js'),
      format: 'cjs',
      exports: 'named',
      outro: tunnckocoreInterop,
      esModule: false,
      sourcemap: true,
      sourcemapExcludeSources: true,
      preferConst: true,
    },
    !process.env.PKG_PATH.endsWith('cli') && {
      file: path.join(process.env.PKG_PATH, 'dist/esm/index.js'),
      format: 'esm',
      sourcemap: true,
      sourcemapExcludeSources: true,
      preferConst: true,
    },
  ].filter(Boolean),
  plugins: [process.env.PKG_PATH.endsWith('cli') && shebang()].filter(Boolean),
};

export default process.env.PKG_PATH ? config : {};

// add shebang
function shebang() {
  return {
    renderChunk(code) {
      return { code: `#!/usr/bin/env node\n\n${code}`, map: null };
    },
  };
}
