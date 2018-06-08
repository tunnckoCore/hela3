export default {
  parser: 'babel-eslint',
  extends: ['airbnb', 'prettier', 'prettier/flowtype', 'prettier/react'],
  plugins: ['unicorn', 'flowtype', 'node', 'prettier'],
  rules: {
    // Enforce using named functions when regular function is used,
    // otherwise use arrow functions
    'func-names': ['error', 'always'],

    // Always use parens (for consistency).
    // https://eslint.org/docs/rules/arrow-parens
    'arrow-parens': ['error', 'always', { requireForBlockBody: true }],

    'prefer-arrow-callback': [
      'error',
      { allowNamedFunctions: true, allowUnboundThis: true },
    ],

    // http://eslint.org/docs/rules/max-params
    'max-params': ['error', { max: 5 }],

    // http://eslint.org/docs/rules/max-statements
    'max-statements': ['error', { max: 20 }],

    // http://eslint.org/docs/rules/max-statements-per-line
    'max-statements-per-line': ['error', { max: 1 }],

    // http://eslint.org/docs/rules/max-nested-callbacks
    'max-nested-callbacks': ['error', { max: 5 }],

    // http://eslint.org/docs/rules/max-depth
    'max-depth': ['error', { max: 5 }],

    // enforces no braces where they can be omitted
    // https://eslint.org/docs/rules/arrow-body-style
    // Never enable for object literal.
    'arrow-body-style': [
      'error',
      'as-needed',
      {
        requireReturnForObjectLiteral: false,
      },
    ],

    // Allow functions to be use before define because:
    // 1) they are hoisted,
    // 2) because ensure read flow is from top to bottom
    // 3) logically order of the code.
    'no-use-before-define': [
      'error',
      {
        functions: false,
        classes: true,
        variables: true,
      },
    ],

    // Same as AirBnB, but adds `opts`, `options` and `err` to exclusions
    // disallow reassignment of function parameters
    // disallow parameter object manipulation except for specific exclusions
    // rule: https://eslint.org/docs/rules/no-param-reassign.html
    'no-param-reassign': [
      'error',
      {
        props: true,
        ignorePropertyModificationsFor: [
          'acc', // for reduce accumulators
          'e', // for e.returnvalue
          'err', // for adding to the Error instance
          'ctx', // for Koa routing
          'req', // for Express requests
          'request', // for Express requests
          'res', // for Express responses
          'response', // for Express responses
          '$scope', // for Angular 1 scopes
          'opts', // useful to ensure the params is always obect
          'options', // and when using Object.assign for shallow copy
        ],
      },
    ],

    'prettier/prettier': [
      'error',
      {
        // Explicitness is the most important thing:
        // - Always is visible that this is function (because the parens).
        // - If you first write single param and decide to add new one,
        // then you should also add a parens around the both - that's mess.
        arrowParens: 'always',

        // Always useful. And guaranteed that you won't see boring errors,
        // that eats your time, because of nothing real.
        trailingComma: 'all',

        // Enforce more clear object literals.
        // That actually is enforced by AirBnB Style anyway.
        // As seen in this example https://github.com/airbnb/javascript#objects--rest-spread
        bracketSpacing: true,

        // Enforcing bracket on the next line makes differentiate
        // where ends the tag and its properties and where starts the content of the tag.
        // https://prettier.io/docs/en/options.html#jsx-brackets
        jsxBracketSameLine: false,

        /**
         * Configurable ones.
         */

        // Ensure Babylon parser is used for javascript.
        // It is possible to change it through flag if you write in Flow or TypeScript.
        parser: 'babylon',

        // Enforce single-quotes, because industry standard.
        singleQuote: true,

        // Enforce 2 spaces, because JavaScript is always different
        // then the rest of the languages.
        tabWidth: 2,
      },
      {
        usePrettierrc: false,
      },
    ],

    // TODO: update
    'import/extensions': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'off',

    // Enforce throwing instead of `process.exit`.
    // https://github.com/mysticatea/eslint-plugin-node/blob/master/docs/rules/process-exit-as-throw.md
    'node/process-exit-as-throw': 'error',

    // Ensure we don't import something that is ignored.
    // https://github.com/mysticatea/eslint-plugin-node/blob/master/docs/rules/process-exit-as-throw.md
    'node/no-unpublished-import': 'off',

    // Ensure we have the defined bin file.
    // https://github.com/mysticatea/eslint-plugin-node/blob/master/docs/rules/process-exit-as-throw.md
    'node/no-unpublished-bin': 'error',

    // Don't use deprecated APIs
    // https://github.com/mysticatea/eslint-plugin-node/blob/master/docs/rules/no-deprecated-api.md
    'node/no-deprecated-api': 'error',

    // It is pretty common to name it `err`,
    // and there is almost no reason to be any other.
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/master/docs/rules/catch-error-name.md
    'unicorn/catch-error-name': ['error', { name: 'err' }],

    // Enforce explicitly comparing the length property of a value.
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/master/docs/rules/explicit-length-check.md
    'unicorn/explicit-length-check': 'error',

    // Pretty useful rule, but it depends.
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/master/docs/rules/filename-case.md
    'unicorn/filename-case': 'off',

    // Enforce specifying rules to disable in `eslint-disable` comments.
    // Be explicit and don't just disable everything. If you want to disable
    // everything because of more errors, reconsider your style or disable that rule temporary.
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/master/docs/rules/no-abusive-eslint-disable.md
    'unicorn/no-abusive-eslint-disable': 'error',

    // Disallow `process.exit`, also related to `node/process-exit-as-throw` rule.
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/master/docs/rules/no-process-exit.md
    'unicorn/no-process-exit': 'error',

    // Require new when throwing an error. (fixable)
    // Don't throw strigs or some other weird things.
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/master/docs/rules/throw-new-error.md
    'unicorn/throw-new-error': 'error',

    // Enforce lowercase identifier and uppercase value for number literals. (fixable)
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/master/docs/rules/number-literal-case.md
    'unicorn/number-literal-case': 'error',

    // Require escape sequences to use uppercase values. (fixable)
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/master/docs/rules/escape-case.md
    'unicorn/escape-case': 'error',

    // Require `Array.isArray()` instead of `instanceof Array`. (fixable)
    // If you need such thing in rare cases, just disable that rule for that
    // specific case and be explicit.
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/master/docs/rules/no-array-instanceof.md
    'unicorn/no-array-instanceof': 'error',

    // Enforce the use of Buffer.from() and Buffer.alloc() instead of the deprecated ones.
    // Also related to the `node/no-deprecated-api` rule.
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/master/docs/rules/no-new-buffer.md
    'unicorn/no-new-buffer': 'error',

    // Enforce the use of unicode escapes instead of hexadecimal escapes. (fixable)
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/master/docs/rules/no-hex-escape.md
    'unicorn/no-hex-escape': 'error',

    // Enforce proper Error subclassing. (fixable)
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/master/docs/rules/custom-error-definition.md
    'unicorn/custom-error-definition': 'error',

    // Prefer `String#startsWith` & `String#endsWith` over more complex alternatives.
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/master/docs/rules/prefer-starts-ends-with.md
    'unicorn/prefer-starts-ends-with': 'error',

    // Enforce throwing TypeError in type checking conditions. (fixable)
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/master/docs/rules/prefer-type-error.md
    'unicorn/prefer-type-error': 'error',

    // Prevents passing a function reference directly to iterator methods. (fixable)
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/master/docs/rules/no-fn-reference-in-iterator.md
    'unicorn/no-fn-reference-in-iterator': 'off',

    // Enforce importing index files with `.` instead of `./index`. (fixable)
    // But we should be explicit. We know it is working without that,
    // but at least it is good for newcomers.
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/master/docs/rules/import-index.md
    'unicorn/import-index': 'off',

    // Enforce the use of new for all builtins, except String, Number and Boolean. (fixable)
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/master/docs/rules/new-for-builtins.md
    'unicorn/new-for-builtins': 'error',

    // Enforce the use of regex shorthands to improve readability. (fixable)
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/master/docs/rules/regex-shorthand.md
    'unicorn/regex-shorthand': 'error',

    // Prefer the spread operator over `Array.from()`. (fixable)
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/master/docs/rules/prefer-spread.md
    'unicorn/prefer-spread': 'error',

    // Enforce passing a message value when throwing a built-in error.
    // "Be explicit" is our motto. Makes errors more useful.
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/master/docs/rules/error-message.md
    'unicorn/error-message': 'error',

    // Disallow unsafe regular expressions.
    // Don't allow potential catastrophic crashes,
    // slow behaving and downtimes. You still can disable that
    // and do whatever you want, but that will be explicit and visible.
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/master/docs/rules/no-unsafe-regex.md
    'unicorn/no-unsafe-regex': 'error',

    // Prefer `addEventListener` over `on`-functions in DOM APIs. (fixable)
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/master/docs/rules/prefer-add-event-listener.md
    'unicorn/prefer-add-event-listener': 'error',
  },
};
