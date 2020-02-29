# git-hooks-list

> List of Git hooks

Data from [Git - githooks Documentation](https://git-scm.com/docs/githooks)

## Install

```bash
yarn add git-hooks-list

# OR with npm

npm install git-hooks-list
```

## Usage

```js
const gitHooks = require('git-hooks-list')

console.log(gitHooks)

// => ['applypatch-msg', 'pre-applypatch', 'post-applypatch', 'pre-commit', ...]
```
