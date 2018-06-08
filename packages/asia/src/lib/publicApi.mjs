/* eslint-disable no-underscore-dangle */

import assert from 'assert';
import autoBind from 'auto-bind';
import AsiaPrivate from './privateApi';

class Asia extends AsiaPrivate {
  constructor(options) {
    super();

    this.options = Object.assign(
      {
        serial: true, // run all tests from each test file in series
        failFast: true,
        showStack: false,
        cache: 60 * 60 * 5000, // 5 mins cache
        assert: Object.assign({ pass: () => assert.ok(true) }, assert),
      },
      options,
    );
    this.stats = Object.assign(
      {
        pass: 0,
        fail: 0,
        count: 0,
        anonymous: 0,
      },
      this.options.stats,
    );

    autoBind(this);
  }

  use(plugin) {
    const res = plugin(this, this.options);
    return res || this;
  }

  pass(onSuccess) {
    this._pass = onSuccess;
    return this;
  }

  fail(onFailure) {
    this._fail = onFailure;
    return this;
  }

  before(hookFn) {
    this._addTo('beforeHooks', hookFn);
    return this;
  }

  beforeEach(hookFn) {
    this._addTo('beforeEachHooks', hookFn);
    return this;
  }

  afterEach(hookFn) {
    this._addTo('afterEachHooks', hookFn);
    return this;
  }

  after(hookFn) {
    this._addTo('afterHooks', hookFn);
    return this;
  }

  addTest(title, fn) {
    let testFn = fn;
    let testTitle = title;

    if (typeof testTitle === 'function') {
      testFn = testTitle;
      testTitle = null;
    }
    if (typeof testFn !== 'function') {
      throw new TypeError('.addTest: expect `testFn` to be a function');
    }
    if (testTitle === null) {
      this.stats.anonymous += 1;
    }

    this.stats.count += 1;

    this._addTo('tests', testFn, testTitle);
    return this;
  }

  runTest(grep) {
    const search = (test) => test.title.indexOf(grep) !== -1;
    return this._runTests(this._tests.filter(search));
  }

  runAll(options) {
    return this._runTests(this._tests, options);
  }
}

export default Asia;
