const kebabCase = (x) => x.replace(/[A-Z]/g, '-$&').toLowerCase();
const hasOwn = (x, key) => Object.prototype.hasOwnProperty.call(x, key);
const isArray = (val) => val && Array.isArray(val) && val.length > 0;

/**
 * Externalize.
 * Correct and simple reversing
 * of minimist-like argv/response object
 * back to array. Useful to be passed
 * to the `spawn` and `exec`-like function.
 *
 * @param {Object} argv
 * @param {Object} options
 */

module.exports = (processArgv, options) => {
  const argv = Object.assign({}, processArgv);
  const opts = Object.assign(
    {
      useEquals: true,
      allowCamelCase: false,
      alias: {},
      default: {},
      bannedFlags: null,
    },
    options,
  );

  const aliases = Object.assign({}, opts.alias);
  const aliasKeys = Object.keys(aliases);
  const args = [];

  Object.keys(argv).forEach((flag) => {
    if (/_/.test(flag) || aliasKeys.includes(flag)) return;

    const isValidFlag =
      isArray(opts.bannedFlags) && !opts.bannedFlags.includes(flag);

    if (opts.bannedFlags === null || isValidFlag) {
      let key = opts.allowCamelCase ? flag : kebabCase(flag);
      const value = hasOwn(argv, flag) ? argv[flag] : opts.default[flag];

      if ((key.length === 1 && value === false) || key.length > 1) {
        key = `-${key}`;
      }

      if (value === false) {
        args.push(`--no${key}`);
      } else if (value === true) {
        args.push(`-${key}`);
      } else if (opts.useEquals) {
        args.push(`-${key}=${value}`);
      } else {
        args.push(`-${key}`);
        args.push(value);
      }
    }
  });

  return argv._ && argv._.length ? args.concat('--').concat(argv._) : args;
};
