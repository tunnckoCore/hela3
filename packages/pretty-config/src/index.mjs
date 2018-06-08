import proc from 'process';
import { resolveConfig, resolveConfigPath } from './utils.mjs';

const configFiles = [
  '.%src.json', // 1
  '.%src.json6', // 2
  '.%src.yaml', // 3
  '.%src.yml', // 4
  '.%src.js', // 5
  '.%src.mjs', // 6
  '%s.config.js', // 7
  '%s.config.mjs', // 8
  '.%s.config.js', // 9
  '.%s.config.mjs', // 10
  '.%src', // 11 - first try JSON, if fail to parse then fallback to YAML
  'package.json', // 12 - pkg.eslint || pkg.eslintConfig || pkg.config.eslint
];

async function prettyConfig(name, options) {
  if (typeof name !== 'string') {
    throw new TypeError('pretty-config: `name` is required argument');
  }
  if (name.length === 0) {
    throw new Error('pretty-config: expect `name` to be non-empty string');
  }

  const opts = Object.assign(
    {
      cwd: proc.cwd(),
      name,
      configFiles,
      envSupport: true,
    },
    options,
  );
  const configPath = resolveConfigPath(opts);

  // we return empty object,
  // because we don't have any config
  // and no errors
  if (!configPath) {
    return null;
  }

  return resolveConfig(opts, configPath).then((cfg) => {
    const envName = proc.env.NODE_ENV;

    if (opts.envSupport && cfg && cfg.env && cfg.env[envName]) {
      return Object.assign({}, cfg, cfg.env[envName]);
    }

    return cfg;
  });
}

prettyConfig.configFiles = configFiles;

// Example:
//
// import { resolveConfig, resolveConfigPath } from 'pretty-config'
//
// const configPath: string = resolveConfigPath(opts)
//
// resolveConfig(opts, configPath)
//   .then((config: any) => console.log('cfg', config))
//   .catch(console.error)

export { prettyConfig, configFiles, resolveConfig, resolveConfigPath };
