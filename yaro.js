/* eslint-disable max-statements */
/* eslint-disable unicorn/no-process-exit */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */

const mri = require('mri');

function isObject(val) {
  return val && typeof val === 'object' && Array.isArray(val) === false;
}

class Yaro {
  constructor(programName, options) {
    if (isObject(programName) && !options) {
      options = programName; // eslint-disable-line no-param-reassign
      programName = null; // eslint-disable-line no-param-reassign
    }
    if (options && typeof options === 'string') {
      options = { version: options }; // eslint-disable-line no-param-reassign
    }

    const progName = typeof programName === 'string' ? programName : 'cli';

    this.settings = {
      cwd: process.cwd(),
      singleMode: false,
      version: '0.0.0',
      ...options,
    };
    this.programName = progName;
    this.currentCommand = {};
    this.commands = new Map();
    this.flags = new Map();
    this.examples = [];
  }

  command(rawName, description, config) {
    if (this.settings.singleMode === true) {
      throw new Error('in single mode cannot add commands');
    }

    // todo: `rest` parsing, variadic args and etc
    const [commandName, ...rest] = rawName.split(' ');

    const command = {
      commandName,
      rawName,
      description,
      config: { ...config },
      rest,
      flags: new Map(),
      examples: [],
      aliases: [],
    };

    command.config.alias = [].concat(command.config.alias).filter(Boolean);
    command.aliases = command.config.alias;

    this.alias(command.aliases);

    this.commands.set(command.commandName, command);
    this.currentCommand = command; // todo: reset in action() ?
    return this;
  }

  option(rawName, description, config) {
    const flag = this.__makeOption(rawName, description, config);

    if (this.settings.singleMode === true || !this.currentCommand) {
      this.flags.set(flag);
    } else {
      this.currentCommand.flags.set(flag.name, flag);
      this.__updateCommandsList();
    }
    return this;
  }

  example(text) {
    if (this.settings.singleMode === true || !this.currentCommand) {
      this.examples.push(text);
    } else {
      this.currentCommand.examples.push(text);
      this.__updateCommandsList();
    }
    return this;
  }

  alias(...aliases) {
    const alias = []
      .concat(this.currentCommand.aliases)
      .concat(...aliases)
      .filter(Boolean);

    this.currentCommand.aliases = alias;
    this.__updateCommandsList();

    return this;
  }

  action(handler) {
    const currentName = this.currentCommand.commandName;
    const fn = (...args) => {
      this.currentCommand = {};
      return handler(...args);
    };
    this.currentCommand.handler = fn;
    this.__updateCommandsList();

    return Object.assign(fn, this.commands.get(currentName));
  }

  version(value) {
    this.option('-v, --version', 'Display version');
    this.settings.version = value || this.settings.version;

    return this;
  }

  showVersion() {
    console.log('some version');
  }

  help(handler) {
    this.option('-h, --help', 'Display help message');
    this.settings.helpHandler = handler || this.settings.helpHandler;

    return this;
  }

  showHelp() {
    console.log('display help here');
  }

  parse(argv = process.argv, options = {}) {
    this.settings = { ...this.settings, options };

    const result = this.__getResult(argv.slice(2));

    if (this.settings.superLazy === true) {
      return result;
    }

    // if there's no args or command name given, by default show help
    const defaultsToHelp = argv.length === 2 && this.settings.defaultsToHelp;

    if (defaultsToHelp || result.flags.help) {
      this.showHelp();
      process.exit(0);
    }

    if (result.flags.version) {
      this.showVersion();
      process.exit(0);
    }

    // todo: better error handling and etc
    if (!this.commands.has(result.commandName) || !result.commandName) {
      if (!this.__existsAsAlias(result.commandName)) {
        console.log('Command not found');
        process.exit(1);
      }
    } else {
      const command = this.commands.get(result.commandName);

      if (this.settings.lazy === true) {
        return { ...result, command };
      }

      command.handler.apply(null, result.args.concat(result.flags, result));
      return { ...result, command };
    }
  }

  __existsAsAlias(name) {
    // eslint-disable-next-line no-restricted-syntax
    for (const cmd of this.commands) {
      if (cmd[0]) {
        const command = cmd[1];
        return command.aliases.includes(name);
      }
    }
    return false;
  }

  __getResult(argv) {
    // Extract everything after `--` since `mri` doesn't support it
    let argsAfterDoubleDashes = [];
    let argsBefore = argv;
    const doubleDashesIndex = argv.indexOf('--');

    if (doubleDashesIndex > -1) {
      argsAfterDoubleDashes = argv.slice(doubleDashesIndex + 1);
      argsBefore = argv.slice(0, doubleDashesIndex);
    }

    const parsed = mri(argsBefore, {
      alias: {
        h: 'help',
        v: 'version',
      },
    });

    const rawArgs = parsed._;
    delete parsed._;

    const flags = { ...parsed, '--': argsAfterDoubleDashes };

    const commandName = rawArgs.slice(0, 1)[0];

    // todo: this `args` actually should be used for variadic and such
    // todo: dont forget the flags.`--` too
    const args = rawArgs.slice(1);

    const result = { commandName, args, rawArgs, flags, parsed };
    return result;
  }

  __updateCommandsList() {
    this.commands.delete(this.currentCommand.commandName);
    this.commands.set(this.currentCommand.commandName, this.currentCommand);

    return this;
  }

  // from `cac`, MIT
  __makeOption(rawName, description, config) {
    const flag = {
      rawName,
      description,
      config: { ...config },
    };

    // You may use cli.option('--env.* [value]', 'desc') to denote a dot-nested option
    flag.rawName = rawName.replace(/\.\*/g, '');

    flag.negated = false;
    flag.names = removeBrackets(rawName)
      .split(',')
      .map((v) => {
        let name = v.trim().replace(/^-{1,2}/, '');
        if (name.startsWith('no-')) {
          flag.negated = true;
          name = name.replace(/^no-/, '');
        }
        return name;
      })
      .sort((a, b) => (a.length > b.length ? 1 : -1)); // Sort names

    // Use the longese name (last one) as actual option name
    flag.name = flag.names[flag.names.length - 1];

    if (flag.negated) {
      flag.config.default = true;
    }

    if (rawName.includes('<')) {
      flag.required = true;
    } else if (rawName.includes('[')) {
      flag.required = false;
    } else {
      // No arg needed, it's boolean flag
      flag.isBoolean = true;
    }

    return flag;
  }
}

/**
 * Example
 */

const cli = new Yaro({ defaultsToHelp: 1 });

cli
  .command('lint', 'Some linting', { alias: ['lnt', 'lnit'] })
  .alias('limnt', 'lintr')
  .alias(['linting', 'lintx'])
  .option('--fix', 'Fix autofixable problems')
  .action((args, flags) => {
    console.log('lint called!');
    // console.log('all params:', args, flags);
  });

const result = cli.parse();

// console.log('result:', result);
