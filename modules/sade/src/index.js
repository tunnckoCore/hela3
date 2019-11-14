/* eslint-disable no-underscore-dangle */
/* eslint-disable max-statements */

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
  SadeError,
  assert,
} from './utils';

const ALL = '__all__';

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

    const DEF = '__default__';
    this._defKey = this.settings.singleMode
      ? [DEF].concat(rest).join(' ')
      : `${DEF} <command>`;

    this.command(this._defKey);

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
    this.tree[this.curr || this._defKey].describe = Array.isArray(str)
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
    const command = this.tree[this.curr || this._defKey];
    command.handler = handler;

    return this;
  }

  example(str) {
    const command = this.tree[this.curr || this._defKey];
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
    // const isVoid = null;
    let name = '';

    if (isSingle) {
      cmd = this.tree[this._defKey];
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
      // isVoid = cmd;
      if (cmd === null) {
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
      return isSingle ? this.help(this.bin) : this.help(name);
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

  help(cmdName, log = true) {
    const cmd = cmdName && typeof cmdName === 'string' ? cmdName : this._defKey;
    const str = printHelp(this, cmd);

    if (log === true) {
      console.log(str);
    } else if (typeof log === 'function') {
      log(str);
    }

    return str;
  }

  ver() {
    console.log(`${this.bin}, ${this.settings.version}`);
  }
}

const sade = (str, options) => new Sade(str, options);

export default sade;

export { SadeError, sade };
