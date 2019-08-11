# utils

> Utility functions and helpers for internal usage.

<!-- ! todo, upgrade readme and use .verb.md --!>

[![npm version][npm-img]][npm-url]
[![Mozilla Public License 2.0][license-img]][license-url]
[![Keybase][keybase-img]][keybase-url]
[![Twitter][twitter-img]][twitter-url]
[![Become a Patron][patreon-img]][patreon-url]
<!-- [![codecov-img][]][codecov-url]-->


## Install

```
yarn add --dev @tunnckocore/utils
```

## Usage

Useful for monorepo and non-monorepo setups, usually used for passing to module resolver options like the `babel-plugin-module-resolver` and `eslint-import-resolver-babel-module`.

If in monorepo setup, it will pick up the `packages/` or whatever you defined on `lerna.json`'s `packages` field, or the `package.json`'s yarn `workspaces` field. If you don't have those defined, then it will return `alias: {}` and the default extensions list.

```js
const { createAliases, getWorkspacesAndExtensions } = require('@tunnckocore/utils');

const result = createAliases(process.cwd());

// => {
//   cwd,
//   alias: {},
//   extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs'],
//   exts: ['js', 'jsx', 'ts', 'tsx', 'mjs'],
// }
```

If you have `lerna.json` (or `workspaces` field in your `package.json`) with `['packages/*', '@tunnckocore/*']` then you can do the following

```js
const { getWorkspacesAndExtensions } = require('@tunnckocore/utils');

console.log(getWorkspacesAndExtensions(process.cwd()));
// => {
//   workspaces: ['packages', '@tunnckore'],
//   extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs'],
//   exts: ['js', 'jsx', 'ts', 'tsx', 'mjs'],
// }
```

If you want to support different extensions, pass `extensions` field in your root `package.json`.

### Example

Make sure you also have `eslint-import-resolver-babel-module` installed.
For example, in your `.eslintrc.js` file you can do the following

```js
const proc = require('process');
const { createAliases } = require('@tunnckocore/utils');

const config = require('my-eslint-config');

module.exports = {
  ...config,

  settings: {
    ...config.settings,

    // by default we assuome your source code is in the package root's src/ dir
    // if you have annother structure pass the name of your source directory.
    'babel-module': createAliases(proc.cwd() /* , 'source' */),
  },
};
```


<!-- definition -->

[keybase-img]: https://badgen.net/keybase/pgp/tunnckoCore
[keybase-url]: https://keybase.io/tunnckoCore

[twitter-img]: https://badgen.net/twitter/follow/tunnckoCore?icon=twitter
[twitter-url]: https://twitter.com/tunnckoCore

[patreon-url]: https://www.patreon.com/bePatron?u=5579781
[patreon-img]: https://badgen.net/badge/patreon/tunnckoCore/F96854?icon=patreon

<!-- dynamic badges -->

[npm-img]: https://badgen.net/npm/v/@tunnckocore/utils?icon=npm
[npm-url]: https://npmjs.com/package/@tunnckocore/utils

[license-img]: https://badgen.net/github/license/tunnckoCoreHQ/utils
[license-url]: https://github.com/tunnckoCoreHQ/utils/tree/master/LICENSE

[codecov-img]: https://badgen.net/codecov/c/github/tunnckoCoreHQ/utils/master?icon=codecov
[codecov-url]: https://codecov.io/gh/tunnckoCoreHQ/utils