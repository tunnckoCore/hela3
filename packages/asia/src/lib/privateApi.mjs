/* eslint-disable no-underscore-dangle, no-param-reassign */

import promisify from 'redolent';
import pMemoize from 'p-memoize';
import pReflect from 'p-reflect';
import pFinally from 'p-finally';
import pSeries from 'p-map-series';
import pMap from 'p-map';
import defaultReporter from './reporter';

export default class AsiaPrivate {
  constructor() {
    this._tests = [];
    this._beforeHooks = [];
    this._beforeEachHooks = [];
    this._afterEachHooks = [];
    this._afterHooks = [];
    this._pass = () => {};
    this._fail = () => {};
  }

  _addTo(type, fn, title) {
    type = `_${type}`;

    if (type === '_tests') {
      fn = promisify(fn);
      fn = pMemoize(fn, this.options.cache);
    }

    fn.title = title || type;
    fn.index = this[type].length + 1;

    this[type].push(fn);
    return this;
  }

  _runTests(tests, options) {
    if (tests.length === 0) {
      const error = new Error('asia: no tests found');
      error.notFound = true;
      return Promise.reject(error);
    }

    this.options = Object.assign({}, this.options, options);
    let reporter = this.options.reporter; // eslint-disable-line prefer-destructuring
    reporter = typeof reporter === 'function' ? reporter : defaultReporter;

    const flow = this.options.serial ? pSeries : pMap;
    const mapper = createMapper(this);

    this.use(reporter);

    this._before();
    return pFinally(
      flow(
        tests,
        mapper,
        this.options,
      ),
      () => this._after(),
    );
  }

  _runHooks(type, test) {
    const hooks = `_${type}Hooks`;
    this[hooks].forEach((hookFn) => {
      hookFn(test);
    });
  }

  _before() {
    this._runHooks('before');
  }

  _beforeEach(test) {
    this._runHooks('beforeEach', test);
  }

  _afterEach(test) {
    this._runHooks('afterEach', test);
  }

  _after() {
    this._runHooks('after');
  }
}

function createMapper(self) {
  return (fn) => {
    self._beforeEach({
      title: fn.title,
      index: fn.index,
      isPending: true,
      isFulfilled: false,
      isRejected: false,
    });

    const promise = fn(self.options.assert);

    return pReflect(promise).then((test) => {
      test = Object.assign({}, test, {
        title: fn.title,
        index: fn.index,
        isPending: false,
      });

      if (test.isRejected) {
        self.stats.fail += 1;
        self._fail(test);
      } else {
        self.stats.pass += 1;
        self._pass(test);
      }

      self._afterEach(test);

      if (test.isRejected && self.options.failFast === true) {
        throw test.reason;
      } else {
        return test;
      }
    });
  };
}
