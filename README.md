# template
A repository template for all repos

## Install with

Install and try the `@hela/dev` shareable config. You can create, compose and publish your own,
everything is super flexible and powerful.

```bash
# everything is on the `next` dist-tag, so:
yarn add --dev @hela/cli@next @hela/dev@next

# And run,
# or with `yarn start`

hela
hela --help
hela lint
hela test
hela build
hela all
```

The only thing that need manual job, for now, is to add `babel.config.js`
file - that's important it isn't the same as `.babelrc.js` one, so it will be only used when running the tests.

```js
// babel config file

/* eslint-disable-next-line import/no-extraneous-dependencies */
module.exports = require('@hela/dev/dist/build/main/configs/babel');
```

The other thing is to put `"hela": { "extends": "@hela/dev" }` in your `package.json` file, or really any other common config file, we are using [cosmiconfic](https://github.com/davidtheclark/cosmiconfig/) for this. 

If you want to try fresh, put `"hela": "./local-relative-path-to-my-config.js"`, then you need to install the `@hela/core` and import it (those config files support both CJS and ESM syntax).

```js
// that's basically the whole API
import { hela, shell, exec, toFlags } from '@hela/core'

// some config
import { lint } from '@hela/dev'

// We need create an "instance" thing.
// This `prog` is just like `sade` - we use it under the hood.
const prog = hela()

// Then we need to start exporting our commands, jobs, tasks,
// or however you want to call it.

export const foo = prog
  .command('build <src> [dest]', 'some example foo command')
  .option('-f, --foo', 'some example flag', false)
  .action((src, argv) => {

    return exec(`echo "fake building '${src}' to dist/ ...."`)
  })

// Guess what?
// You can just run `hela bar` and it will
// use the `@hela/dev`'s `lint` command. 
export const bar = lint

// What about using inside other commands? No problem.
// Here we just use and call the above `foo` command. 
export const qux = prog.
  .command('qux', 'foo bar baz qux')
  .action((argv) => foo('quxie', argb))
```

It's truly beautiful, composable, flexible and amazing! :heart:
In bonus, you get great features because Sade - like subcommands, `--help` handling,
cool help output and ton other stuff. Thanks [@luuked](https://github.com/lukeed).


Every other thing is handled by internal babel and jest configs. Look at the `hela-dev/src/configs`.

You also can pass few Jest flags:
- `--all`
- `--watch`

and few others like `--mono` (not really needed, we are smart enough to know if we are in monorepo environment) and `--cwd` (also not needed, haha).


## The `build` command

For now it only building (not bundling) CJS and ESM outputs, respectively in `dist/build/main` which you should use as your `"main"` field and `dist/build/module` for your `"module"` field.

Currently, you cannot disable that behaving, it will always build the two.

### About the Jest yellow warning

You can see that Jest output some warning. Nothing special, don't worry. It's because currently there's no way to pass custom options to jest runners. So, this warning is about that we relay on putting "jest runner options" into the Jest's global config `haste` object. But that's a pretty specific field in the Jest global config, also we use namespacing so it won't hurt anything.

In Jest 25, there will be major refactoring about that and the messy glob & regex matching patterns and etc stuff. It will be brilliant release and we are waiting it! Until then, we'll stick to that.

## For `hela` in general

The API, examples, explaination and docs - later.