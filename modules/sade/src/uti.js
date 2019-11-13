const GAP = 4;
const __ = '  ';
const ALL = '__all__';
const DEF = '__default__';
const NL = '\n';

function format(arr) {
  if (!arr.length) return '';
  let len = maxLen(arr.map((x) => x[0])) + GAP;
  let join = (a) =>
    a[0] +
    ' '.repeat(len - a[0].length) +
    a[1] +
    (a[2] == null ? '' : `  (default ${a[2]})`);
  return arr.map(join);
}

function maxLen(arr) {
  let c = 0,
    d = 0,
    l = 0,
    i = arr.length;
  if (i)
    while (i--) {
      d = arr[i].length;
      if (d > c) {
        l = i;
        c = d;
      }
    }
  return arr[l].length;
}

function noop(s) {
  return s;
}

function section(str, arr, fn) {
  if (!arr || !arr.length) return '';
  let i = 0,
    out = '';
  out += NL + __ + str;
  for (; i < arr.length; i++) {
    out += NL + __ + __ + fn(arr[i]);
  }
  return out + NL;
}

exports.getCmd = function getCmd(tree, name) {
  return Object.keys(tree).find((key) => key.startsWith(name));
};

exports.help = function(
  { tree, bin, settings: { singleMode }, commandAliases },
  key,
) {
  let out = '';
  const cmd = tree[key];
  const isDefault = key ? key === DEF : key;
  const prefix = (s) => `$ ${bin} ${s}`.replace(/\s+/g, ' ');

  // update ALL & CMD options
  let tail = [['-h, --help', 'Displays this message']];
  if (isDefault) tail.unshift(['-v, --version', 'Displays current version']);
  cmd.options = (cmd.options || []).concat(tree[ALL].options, tail);

  // write options placeholder
  if (cmd.options.length > 0) cmd.usage += ' [options]';

  // description ~> text only; usage ~> prefixed
  out += section('Description', cmd.describe, noop);
  out += section('Usage', [cmd.usage], prefix);

  if (!singleMode && isDefault) {
    const cmdAliases = Object.values(commandAliases).reduce((acc, aliases) => {
      return acc.concat(aliases);
    }, []);

    // General help :: print all non-internal commands & their 1st line of text
    let cmds = Object.keys(tree[ALL]).filter(
      (k) => !/__/.test(k) && !cmdAliases.includes(k),
    );

    let text = cmds.map((k) => {
      const cmdTree = tree[k];
      const desc = (cmdTree.describe || [''])[0];

      return [k, desc];
    });
    out += section('Available Commands', format(text), noop);

    out += NL + __ + 'For more info, run any command with the `--help` flag';
    cmds.slice(0, 2).forEach((k) => {
      out += NL + __ + __ + `${bin} ${k} --help`;
    });
    out += NL;
  }

  out += section('Options', format(cmd.options), noop);
  out += section('Examples', cmd.examples.map(prefix), noop);

  return out;
};

exports.error = function(bin, str, num = 1) {
  let out = section('ERROR', [str], noop);
  out += NL + __ + `Run \`$ ${bin} --help\` for more info.` + NL;
  console.error(out);
  process.exit(num);
};

// Strips leading `-|--` & extra space(s)
exports.parse = function(str) {
  return (str || '').split(/^-{1,2}|,|\s+-{1,2}|\s+/).filter(Boolean);
};

// @see https://stackoverflow.com/a/18914855/3577474
exports.sentences = function(str) {
  return (str || '').replace(/([.?!])\s*(?=[A-Z])/g, '$1|').split('|');
};

exports.existsAsCommandAlias = function(val, commandAliases) {
  let found = Object.values(commandAliases).find((aliases) =>
    aliases.includes(val),
  );

  return found;
};

exports.createAliasCommands = function(tree, commandAliases) {
  Object.keys(commandAliases).forEach((name) => {
    const aliases = commandAliases[name];
    const command = tree[name];

    aliases.forEach((aliasName) => {
      tree[aliasName] = command;
    });
  });
};

exports.isObject = (val) => {
  return val && typeof val === 'object' && Array.isArray(val) === false;
};
