/* eslint-disable max-statements */
/* eslint-disable max-classes-per-file */

import mri from 'mri';
import {
  isObject,
  existsAsCommandAlias,
  sentences,
  parseOption,
  printHelp,
  printError,
  getCmd,
  createAliasCommands,
} from './utils';

export class SadeError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'SadeError';
  }
}

const assert = (cond, message) => {
  if (!cond) {
    throw new SadeError(message);
  }
};

const ALL = '__all__';
const DEF = '__default__';

export class Sade {
  constructor(name, singleCommandMode) {
    const [bin, ...rest] = name.split(/\s+/);

    const singleMode = singleCommandMode === true || rest.length > 0;
    const settings = isObject(singleCommandMode) ? singleCommandMode : {};

    this.settings = {
      singleMode,
      defaultCommand: '',
      version: '0.0.0',
      ...settings,
    };

    this.bin = bin;
    this.tree = {};
    this.commandAliases = {};

    this.command(ALL);
    this.command(
      [DEF].concat(this.settings.singleMode ? rest : '<command>').join(' '),
    );
    this.curr = '';
  }

  command(str, desc, opts = {}) {
    assert(
      this.settings.singleMode,
      'Disable "options.singleMode" to add commands',
    );

    const [cmdName, ...cmdParts] = str.split(/\s+/);
    let cmd = [];
    let usage = [];

    [cmdName, ...cmdParts].forEach((x) => {
      const firstChar = x.charAt(0);
      const isNotCommand = firstChar === '[' && firstChar === '<';

      // All args that are not starting with < or [ are commands!
      if (isNotCommand) {
        usage.push(x);
      } else {
        cmd.push(x);
      }
    });

    // Back to string~!
    cmd = cmd.join(' ');

    assert(
      existsAsCommandAlias(cmd, this.commandAliases) || cmd in this.tree,
      `Command already exists: ${cmd}`,
    );

    // re-include `cmd` for commands
    if (!cmd.includes('__')) {
      usage.unshift(cmd);
    }
    usage = usage.join(' '); // to string

    // last one (`opts.default`) should be deprecated?
    const cmdDefaults = opts.defaultCommand || opts.defaults || opts.default;
    const defaultValues =
      cmdDefaults && typeof cmdDefaults !== 'boolean'
        ? [].concat(cmdDefaults).filter(Boolean)
        : [];

    this.curr = cmd;
    if (cmdDefaults === true) {
      this.settings.defaultCommand = cmd;
    }

    const task = {
      usage,
      options: [],
      alias: {},
      default: {},
      examples: [],
      defaultValues,
    };

    this.tree[cmd] = task;

    this.alias([].concat(opts.alias).filter(Boolean));

    if (desc) {
      this.describe(desc);
    }

    return this;
  }

  alias(...aliases) {
    const alias = []
      .concat(this.commandAliases[this.curr])
      .concat(...aliases)
      .filter(Boolean);

    this.commandAliases[this.curr] = alias;

    return this;
  }

  describe(str) {
    this.tree[this.curr || DEF].describe = Array.isArray(str)
      ? str
      : sentences(str);

    return this;
  }

  option(str, desc, val) {
    const cmd = this.tree[this.curr || ALL];

    let [flag, alias] = parseOption(str);
    if (alias && alias.length > 1) [flag, alias] = [alias, flag];

    let value = `--${flag}`;
    if (alias && alias.length > 0) {
      value = `-${alias}, ${value}`;
      const old = cmd.alias[alias];
      cmd.alias[alias] = (old || []).concat(flag);
    }

    const arr = [value, desc || ''];

    if (!val) {
      arr.push(val);
      cmd.default[flag] = val;
    } else if (!alias) {
      cmd.default[flag] = undefined;
    }

    cmd.options.push(arr);

    return this;
  }

  action(handler) {
    const command = this.tree[this.curr || DEF];
    command.handler = handler;

    return this;
  }

  example(str) {
    const command = this.tree[this.curr || DEF];
    command.examples.push(str);

    return this;
  }

  version(str) {
    this.settings.version = str;
    return this;
  }

  parse(arr, opts = {}) {
    let offset = 2; // argv slicer
    const alias = { h: 'help', v: 'version' };
    const argv = mri(arr.slice(offset), { alias });
    const isSingle = this.settings.singleMode;
    let { bin } = this;
    let tmp = null;
    let cmd = null;
    let isVoid = null;
    let name = '';

    if (isSingle) {
      cmd = this.tree[DEF];
    } else {
      // Loop thru possible command(s)
      let i = 1;
      const len = argv._.length + 1;
      // eslint-disable-next-line no-plusplus
      for (; i < len; i++) {
        tmp = argv._.slice(0, i).join(' ');

        const exists = existsAsCommandAlias(tmp, this.commandAliases);

        if (exists || tmp in this.tree) {
          name = tmp;
          offset = i + 2; // argv slicer
        }
      }

      // create commands from aliases for every command's alias
      createAliasCommands(this.tree, this.commandAliases);

      cmd = getCmd(this.tree, name);
      isVoid = cmd === undefined;

      if (isVoid) {
        if (this.settings.defaultCommand) {
          name = this.settings.defaultCommand;
          cmd = getCmd(this.tree, name);
          arr.unshift(name);
          offset += 1;
        } else if (tmp) {
          return printError(bin, `Invalid command: ${tmp}`);
        } //= > else: cmd not specified, wait for now...
      }
    }

    // show main help if relied on "default" for multi-cmd
    if (argv.help) {
      return isSingle ? this.help(this.bin) : this.help();
    }
    if (argv.version) {
      return this.ver();
    }

    if (!isSingle && !cmd) {
      return printError(bin, 'No command specified.');
    }

    const all = this.tree[ALL];
    // merge all objects :: params > command > all
    opts.alias = Object.assign(all.alias, cmd.alias, opts.alias);
    opts.default = Object.assign(all.default, cmd.default, opts.default);

    const vals = mri(arr.slice(offset), opts);
    if (!vals || typeof vals === 'string') {
      return printError(bin, vals || 'Parsed unknown option flag(s)!');
    }

    const segs = cmd.usage.split(/\s+/).slice(1);
    const reqs = segs.filter((x) => x.charAt(0) === '<');
    const argz = vals._.slice(reqs.length);

    if (argz.length < reqs.length) {
      if (name) bin += ` ${name}`; // for help text
      return printError(bin, 'Insufficient arguments!');
    }

    const args = segs
      .reduce((acc, item, idx) => {
        const value = argz[idx];

        // adds `undefined` or the default value, per [slot] if no more
        if (item.charAt(0) === '[') {
          const defaultVal = cmd.defaultValues[idx];

          return acc.concat(value || defaultVal);
        }

        return acc.concat(value);
      }, [])
      .concat(argz); // flags & co are last

    const { handler } = cmd;
    return opts.lazy ? { args, name, handler } : handler(...args);
  }

  help(str) {
    console.log(printHelp(this, str || DEF));
  }

  ver() {
    console.log(`${this.bin}, ${this.settings.version}`);
  }
}

export const sade = (str, options) => new Sade(str, options);

export default sade;
