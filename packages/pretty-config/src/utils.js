/* eslint-disable no-param-reassign */

const fs = require('fs');
const path = require('path');
const util = require('util');
const yaml = require('js-yaml');
const JSON6 = require('json-6');

function isObject(val) {
  return val && typeof val === 'object' && !Array.isArray(val);
}

function interop(ex) {
  return isObject(ex) && 'default' in ex ? ex.default : ex;
}

function resolveConfigPath(opts) {
  const configFilepath = opts.configFiles.reduce((configPath, fp) => {
    // really, hit fs only once, we don't care
    // if there is more existing config files,
    // we care about the first found one
    if (configPath.length > 0) {
      return configPath;
    }

    const resolvePath = (filePath) => path.resolve(opts.cwd, filePath);

    if (fp === 'package.json') {
      fp = resolvePath(fp);
    } else {
      fp = resolvePath(util.format(fp, opts.name));
    }

    if (fs.existsSync(fp)) {
      configPath += fp;
    }

    return configPath;
  }, '');

  return configFilepath;
}

async function resolveConfig(opts, configPath) {
  const contents = await util.promisify(fs.readFile)(configPath, 'utf8');

  // 1) if `.eslintrc.json` or `.eslintrc.json6`
  if (/\.json6?/.test(configPath) && !configPath.endsWith('package.json')) {
    const json = configPath.endsWith('.json6') ? JSON6 : JSON;

    return json.parse(contents);
  }

  // 2) if `.eslintrc.yaml` or `.eslintrc.yml`
  if (/\.ya?ml$/.test(configPath)) {
    return yaml.safeLoad(contents);
  }

  // 3) if one of those (depends on `configFiles` order)
  // Note: Both CommonJS and ESModules are possible :)
  // - 3.1) `.eslintrc.js`
  // - 3.2) `.eslintrc.mjs`
  // - 3.3) `eslint.config.js`
  // - 3.4) `eslint.config.mjs`
  // - 3.5) `.eslint.config.js`
  // - 3.6) `.eslint.config.js`
  if (/\.m?js$/.test(configPath)) {
    // TODO: When target Node >=8:
    const esmLoader = require('esm'); // eslint-disable-line global-require
    const esmOpts = { cjs: true, mode: 'all' };

    const esmRequire = interop(esmLoader)(module, esmOpts);
    const config = esmRequire(configPath);
    return interop(config);
  }

  // 4) if `.eslintrc`:
  // - 4.1) try to parse as JSON first, otherwise
  // - 4.2) try to parse as YAML
  if (configPath.endsWith('rc')) {
    // TODO: When target Node >=8:
    try {
      return JSON.parse(contents);
    } catch (err) {
      if (err.name === 'SyntaxError') {
        return yaml.safeLoad(contents);
      }
      throw err;
    }
  }

  // 5) if config in package.json:
  const pkg = JSON.parse(contents);

  // - 5.1) pkg.eslint
  return (
    pkg[opts.name] ||
    // - 5.2) pkg.eslintConfig
    pkg[`${opts.name}Config`] ||
    // - 5.3) pkg.config.eslint
    (pkg.config && pkg.config[opts.name]) ||
    // - 5.4) otherwise falsey value
    null
  );
}

module.exports = { resolveConfigPath, resolveConfig };
