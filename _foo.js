// const { existsSync } = require('fs');
// const { join } = require('path');

// const roots = 'modules';
// const rePkg = new RegExp(`(${roots}/([\\w\\-_]+))/?`);
// const diff = `jest-runner.config.js
// modules/format/sasa
// pnpm-workspace.yaml`;

// const filters = diff
//   .split('\n')
//   .filter((line) => rePkg.test(line) && existsSync(join(__dirname, line)))
//   .map((line) => {
//     console.log(line.match(rePkg));
//     const [, directory] = line.match(rePkg);
//     return `--filter ./${directory}`;
//   });

// console.log(filters);

/**
 * ## Deno <-> Node.js Compat (CLI)
 *
 * - Deno source, two build targets: nodejs (esm & cjs) & browser (esm)
 * - For nodejs target:
 *   + rollup babel as very first plugin (with babelrc: false)
 *     to transform url (deno apis) to bare specifier (nodejs apis)
 *   + cjs and esm rollup "format"s
 * - For browsers target:
 *   + detect if URL specifier ends with `.ts`
 *   + then rollup url import/resolve plugin (as very first),
 *   + then rollup babel (as very first) transform (with babelrc: false)
 *     the typescript to javascript, then user-land (allow babelrc)
 *
 */

// import name from 'path';
