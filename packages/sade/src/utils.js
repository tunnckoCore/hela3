const GAP = 4;

// eslint-disable-next-line no-underscore-dangle
const __ = '  ';

const ALL = '__all__';
const NL = '\n';

function format(arr) {
  if (arr.length === 0) return '';
  const len = maxLen(arr.map((x) => x[0])) + GAP;

  return arr.map(
    (a) =>
      a[0] +
      ' '.repeat(len - a[0].length) +
      a[1] +
      (a[2] == null ? '' : `  (default ${a[2]})`),
  );
}

function maxLen(arr) {
  let c = 0;
  let d = 0;
  let l = 0;
  let i = arr.length;
  if (i) {
    // eslint-disable-next-line no-plusplus
    while (i--) {
      d = arr[i].length;
      if (d > c) {
        l = i;
        c = d;
      }
    }
  }
  return arr[l].length;
}

function noop(s) {
  return s;
}

function section(str, arr, fn) {
  if (!arr || arr.length === 0) return '';
  let i = 0;
  let out = '';
  out += NL + __ + str;
  // eslint-disable-next-line no-plusplus
  for (; i < arr.length; i++) {
    out += NL + __ + __ + fn(arr[i]);
  }
  return out + NL;
}
export class SadeError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'SadeError';
  }
}

export function assert(cond, message) {
  if (cond) {
    throw new SadeError(message);
  }
}

export function getCmd(tree, name, fallback = false) {
  if (!name) return fallback ? tree : null;

  const cmd = Object.keys(tree)
    // .filter((x) => !x.startsWith(ALL) && !x.startsWith(DEF))
    .find((key) => key.startsWith(name));

  if (cmd) return tree[cmd];

  return fallback ? tree : null;
}

// eslint-disable-next-line max-statements
export function printHelp(ctx, key) {
  let out = '';
  const cmd = getCmd(ctx.tree, key);
  // console.log(ctx);
  // eslint-disable-next-line no-underscore-dangle
  const isDefault = key ? key === ctx._defKey : key;
  const prefix = (s) => `$ ${ctx.bin} ${s}`.replace(/\s+/g, ' ');

  // update ALL & CMD options
  const tail = [['-h, --help', 'Displays this message']];
  if (isDefault) tail.unshift(['-v, --version', 'Displays current version']);
  cmd.options = (cmd.options || []).concat(ctx.tree[ALL].options, tail);

  // write options placeholder
  if (cmd.options.length > 0) cmd.usage += ' [options]';

  // description ~> text only; usage ~> prefixed
  out += section('Description', cmd.describe, noop);
  out += section('Usage', [cmd.usage], prefix);

  if (!ctx.settings.singleMode /* && isDefault */) {
    const cmdAliases = Object.values(ctx.commandAliases).reduce(
      (acc, aliases) => acc.concat(aliases),
      [],
    );

    // General help :: print all non-internal commands & their 1st line of text
    const cmds = Object.keys(ctx.tree).filter(
      (k) => !/__/.test(k) && !cmdAliases.includes(k),
    );

    const text = cmds.map((k) => {
      const desc = (ctx.tree[k].describe || [''])[0];

      return [k, desc];
    });
    out += section('Available Commands', format(text), noop);

    out += `${NL + __}For more info, run any command with the \`--help\` flag`;
    cmds
      .filter((k) => !k.startsWith('help'))
      .slice(0, 2)
      .forEach((k) => {
        out += `${NL + __ + __}${ctx.bin} ${k} --help`;
      });
    out += NL;
  }

  out += section('Options', format(cmd.options), noop);
  out += section('Examples', cmd.examples.map(prefix), noop);

  return out;
}

export function printError(bin, str, num = 1) {
  let out = section('ERROR', [str], noop);
  out += `${NL + __}Run \`$ ${bin} --help\` for more info.${NL}`;

  console.error(out);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(num);
}

// Strips leading `-|--` & extra space(s)
export function parseOption(str) {
  return (str || '').split(/^-{1,2}|,|\s+-{1,2}|\s+/).filter(Boolean);
}

// @see https://stackoverflow.com/a/18914855/3577474
export function sentences(str) {
  return (str || '').replace(/([!.?])\s*(?=[A-Z])/g, '$1|').split('|');
}

export function existsAsCommandAlias(val, commandAliases) {
  const found = Object.values(commandAliases).find((aliases) =>
    aliases.includes(val),
  );

  return found;
}

export function createAliasCommands(tree, commandAliases) {
  Object.keys(commandAliases).forEach((name) => {
    const aliases = commandAliases[name];
    const command = tree[name];

    aliases.forEach((aliasName) => {
      // eslint-disable-next-line no-param-reassign
      tree[aliasName] = command;
    });
  });
}

export function isObject(val) {
  return val && typeof val === 'object' && Array.isArray(val) === false;
}

export function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}