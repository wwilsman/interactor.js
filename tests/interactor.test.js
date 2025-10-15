import { describe, it, beforeEach } from 'moonshiner';
import { I, fixture, assert } from './helpers';

import {
  Interactor,
  Interaction,
  Assert,
  Assertion,
  Arrangement,
  Context
} from 'interactor.js';

describe('Interactor', () => {
  it('exports a default interactor instance', async () => {
    let exports = await import('interactor.js');

    await assert(exports.default instanceof Interactor,
      'Default export is not an interactor instance');
  });

  it('has default context options', async () => {
    let ctx = new Interactor()[Interactor.Context.Symbol];

    await assert(ctx.root() === document.body,
      'Expected the default root return the document body');
    await assert(ctx.selector.query() === document.body,
      'Expected the default selector to return the root element');
    await assert(ctx.assert.timeout === 1000,
      'Expected the default assert timeout to be 1000');
    await assert(ctx.assert.frequency === 60,
      'Expected the default assert frequency to be 60');
    await assert(ctx.assert.reliability === 1,
      'Expected the default assert reliability to be 1');
  });

  it('can be initialized with custom context options', async () => {
    fixture('<p>test</p>');

    let ctx = new Interactor({
      assert: { timeout: 100, frequency: 10, reliability: 5 },
      root: () => document.getElementById('testing-root'),
      selector: 'test'
    })[Interactor.Context.Symbol];

    await assert(ctx.root()?.id === 'testing-root',
      'Expected the root id to be "testing-root"');
    await assert(ctx.selector.query().tagName.toLowerCase() === 'p',
      'Expected the selector to return a paragraph element');
    await assert(ctx.assert.timeout === 100,
      'Expected the assert timeout to be 100');
    await assert(ctx.assert.frequency === 10,
      'Expected the assert frequency to be 10');
    await assert(ctx.assert.reliability === 5,
      'Expected the assert reliability to be 5');
  });

  it('accepts an abort signal when awaiting on interactions', async () => {
    let ctrl = new AbortController();
    let test = 1;

    await I.act(() => test++)
      .then({ signal: ctrl.signal });

    await assert.throws(
      I.act(() => test++)
        .then.act(() => test++)
        .then.act(() => ctrl.abort(
          new Error('Interaction aborted')))
        .then.assert(() => test === 0)
        .then({ signal: ctrl.signal }),
      'Interaction aborted');

    await assert(test === 4,
      'Expected test to be 4');
  });

  describe('.defineAction(name, action)', () => {
    it('defines an action', async () => {
      class TestInteractor extends Interactor {}
      let T = new TestInteractor();
      let pass = false;

      TestInteractor.defineAction('test', b => {
        return pass = b;
      });

      await assert(typeof T.test === 'function',
        'Expected test to be a function');
      await assert(T.test(true) instanceof Interaction,
        'Expected test to return an Interaction instance');
      await assert(!pass,
        'Expected test not to pass');
      await assert(await T.test(true) === true,
        'Expected test interaction to resolve true');
      await assert(pass,
        'Expected test to pass');
    });

    it('accepts an interaction class', async () => {
      class TestInteractor extends Interactor {}
      let T = new TestInteractor();
      let pass = false;

      class TestInteraction extends Interaction {
        constructor(b) { super(() => pass = b); }
      }

      TestInteractor.defineAction('test', TestInteraction);

      await assert(typeof T.test === 'function',
        'Expected test to be a function');
      await assert(T.test(true) instanceof TestInteraction,
        'Expected test to return an TestInteraction instance');
      await assert(!pass,
        'Expected test not to pass');
      await assert(await T.test(true) === true,
        'Expected test interaction to resolve true');
      await assert(pass,
        'Expected test to pass');
    });
  });

  describe('.defineActions(actions)', () => {
    it('calls .defineAction() for every action', async () => {
      let calls = [];

      class TestInteractor extends Interactor {
        static defineAction(...args) {
          calls.push(args);
          return this;
        }
      }

      let foo = () => {};
      let bar = class TestInteraction extends Interaction {};
      TestInteractor.defineActions({ foo, bar });

      await assert(calls.length === 2,
        'Expected .defineAction() to be called 2 times');
      await assert(calls[0][0] === 'foo' && calls[0][1] === foo,
        'Expected .defineAction() to be called with foo');
      await assert(calls[1][0] === 'bar' && calls[1][1] === bar,
        'Expected .defineAction() to be called with bar');
    });
  });

  describe('.defineAssertion(name, assertion)', () => {
    it('calls Assert.defineAssertion()', async () => {
      let calls = [];

      class TestInteractor extends Interactor {
        static Assert = class TestAssert extends Assert {
          static defineAssertion(...args) {
            calls.push(args);
            return this;
          }
        };
      }

      let test = () => {};
      TestInteractor.defineAssertion('test', test);

      await assert(calls.length === 1,
        'Expected .defineAssertion() to be called 1 time');
      await assert(calls[0][0] === 'test' && calls[0][1] === test,
        'Expected .defineAssertion() to be called with test');
    });
  });

  describe('.defineAssertions(assertions)', () => {
    it('calls Assert.defineAssertions()', async () => {
      let calls = [];

      class TestInteractor extends Interactor {
        static Assert = class TestAssert extends Assert {
          static defineAssertions(...args) {
            calls.push(args);
            return this;
          }
        };
      }

      let assertions = { test: () => {} };
      TestInteractor.defineAssertions(assertions);

      await assert(calls.length === 1,
        'Expected .defineAssertion() to be called 1 time');
      await assert(calls[0][0] === assertions,
        'Expected .defineAssertion() to be called with assertions');
    });
  });

  describe('.assert', () => {
    it('can define custom assertions on an instance', async () => {
      let pass = false;

      class TestInteractor extends Interactor {
        static assert = { test: b => pass = b };
      }

      let T = new TestInteractor({
        assert: { timeout: 100, reliability: 0 }
      });

      await assert(typeof I.assert.test === 'undefined',
        'Expected test not to be defined on the base interactor');
      await assert(typeof T.assert.test === 'function',
        'Expected test to be a function');
      await assert(T.assert.test(true) instanceof Assertion,
        'Expected test to return an Assertion instance');
      await assert(!pass,
        'Expected test not to pass');
      await assert(await T.assert.test(true) === true,
        'Expected test assertion to resolve true');
      await assert(pass,
        'Expected test to pass');
    });
  });

  describe('#arrange(callback)', () => {
    it('creates a new arrangement', async () => {
      await assert(I.arrange(() => {}) instanceof Arrangement,
        'Expected arrange to return an Arrangement instance');
      await assert(await I.arrange(() => 'test') === 'test',
        'Expected setup to return "test"');
    });

    it('can be chained with other interactions', async () => {
      let test = [];

      let interaction = I.arrange(() => test.push('foo'))
        .then.act(() => test.push('bar'))
        .then.assert(() => test.push('baz'));

      await assert(interaction instanceof Assertion,
        'Expected interaction to be an Assertion instance');
      await assert(await interaction && test.length === 3,
        'Expected interaction test to have 3 values');
      await assert(test[0] === 'foo' && test[1] === 'bar' && test[2] === 'baz',
        'Expected test array to contain "foo", "bar", "baz"');
    });

    it('can manipulate the interactor context', async () => {
      let I = new Interactor();

      await I.arrange(async ctx => {
        await assert(ctx instanceof Context,
          'Expected a Context instance');
        ctx.set({ test: 'foobar' });
      });

      await assert(I[Context.Symbol].test === 'foobar',
        'Expected interactor context to contain a test property');
    });
  });

  describe('#act(interaction)', () => {
    it('creates a new interaction', async () => {
      await assert(I.act(() => {}) instanceof Interaction,
        'Expected action to be an Interaction instance');
      await assert(await I.act(() => 'test') === 'test',
        'Expected action to return "test"');
    });

    it('accepts an interaction instance', async () => {
      let interaction = new Interaction(() => 'test');
      await assert(I.act(interaction) instanceof Interaction,
        'Expected action to be an Interaction instance');
      await assert(await I.act(interaction) === 'test',
        'Expected action to return "test"');
    });

    it('can be chained with other interactions', async () => {
      let test = [];

      let interaction = I.act(() => test.push('foo'))
        .then.assert(() => test.push('bar'));

      await assert(interaction instanceof Assertion,
        'Expected interaction to be an Assertion instance');
      await assert(await interaction && test.length === 2,
        'Expected interaction test to have 2 values');
      await assert(test[0] === 'foo' && test[1] === 'bar',
        'Expected test array to contain "foo", "bar"');
    });

    it('can set context properties for nested interactions', async () => {
      let interaction = I.act(({ set }) => {
        set({ test: 'foobar' });
        return I.act(({ test }) => test);
      });

      await assert(await interaction === 'foobar',
        'Expected action to return "foobar"');
    });

    it('references the root element by default', async () => {
      await assert(await I.act(({ $ }) => $.id) === 'testing-root',
        'Expected root element id to be "testing-root"');
      await assert(await I.act(({ $$ }) => $$.length) === 1,
        'Expected a single root element');
    });
  });

  describe('#assert(assertion)', () => {
    it('creates a new assertion', async () => {
      await assert(I.assert(true) instanceof Assertion,
        'Expected assertion to be an Assertion instance');
      await assert(I.assert(() => true),
        'Expected assertion to pass when true');
      await assert(I.assert(() => {}),
        'Expected assertion to pass when undefined');
    });

    it('accepts a failure message', async () => {
      await assert.throws(I.assert(false),
        'Assertion failed');
      await assert.throws(I.assert(() => false, 'Epic fail'),
        'Epic fail');
    });

    it('accepts an assertion instance', async () => {
      let assertion = new Assertion(() => true);
      await assert(I.assert(assertion) instanceof Assertion,
        'Expected assertion to be an Assertion instance');
      await assert(await I.assert(assertion),
        'Expected assertion to pass');
    });

    it('can be chained with other interactions', async () => {
      let test = [];

      let interaction = I.assert(() => test.push('foo'))
        .then.act(() => test.push('bar'));

      await assert(interaction instanceof Interaction,
        'Expected interaction to be an Interaction instance');
      await assert(await interaction && test.length === 2,
        'Expected interaction test to have 2 values');
      await assert(test[0] === 'foo' && test[1] === 'bar',
        'Expected test array to contain "foo", "bar"');
    });

    it('retries assertions until passing', async () => {
      let T = new Interactor({ assert: { timeout: 500, reliability: 0 } });
      let attempts = 0;

      await T.assert(() => (attempts += 1) === 5);

      await assert(attempts === 5,
        'Expected 5 assertion attempts');
    });

    it('runs assertions again after passing', async () => {
      let T = new Interactor({ assert: { timeout: 500, reliability: 5 } });
      let attempts = 0;

      await T.assert(() => (attempts += 1) >= 5);

      await assert(attempts === 10,
        'Expected 10 assertion attempts');
    });

    it('references the root element by default', async () => {
      fixture('<p id="test">Test</p>');

      await assert(I.assert(({ $ }) => $.id === 'testing-root'),
        'Expected root element id to be "testing-root"');

      await assert.throws(
        I.assert(({ $ }) => $.id !== 'testing-root',
          'Expected #{this} id to be "testing-root"'),
        'Expected root element id to be "testing-root"');
    });
  });

  describe('#find(selector)', () => {
    beforeEach(() => {
      fixture(`
        <p>Foo</p>
        <p class="bar">Bar</p>
        <p data-test="baz">Baz</p>
        <p data-test-qux>Qux</p>
        <div><input placeholder="Xyyz"/></div>
        <p>Foo</p>
      `);
    });

    it('creates a new find assert', async () => {
      await assert(I.find('Foo') instanceof Assert,
        'Expected #find() to return an Assert instance');
      await assert((await I.find('Foo')).innerText === 'Foo',
        'Expected to find the "Foo" element');
      await assert.throws(I.find('foo'),
        'Could not find "foo"');
    });

    it('accepts a query selector syntax', async () => {
      await assert((await I.find('$(.bar)')).innerText === 'Bar',
        'Expected to find the "Bar" element');
    });

    it('accepts a test attribute selector syntax', async () => {
      await assert((await I.find('::(baz)')).innerText === 'Baz',
        'Expected to find the "Baz" element');
      await assert((await I.find('::qux')).innerText === 'Qux',
        'Expected to find the "Qux" element');
    });

    it('accepts a combined selector syntax', async () => {
      let $foo = document.querySelector('p:last-child');

      await assert(await I.find('"Foo" $(:last-child)') === $foo,
        'Expected to find the last "Foo" element');
    });

    it('accepts a regular expression', async () => {
      let $qux = document.querySelector('[data-test-qux]');

      await assert(await I.find(/^Q/) === $qux,
        'Expected to find the "Qux" element');

      let $xyyz = document.querySelector('div > input');

      await assert(await I.find(/y{2}/) === $xyyz,
        'Expected to find the "Xyyz" input element');
    });

    it('accepts a selector function', async () => {
      let $bar = document.querySelector('.bar');

      await assert((await I.find(() => $bar)) === $bar,
        'Expected to resolve the "Bar" element');
    });

    it('accepts an element instance', async () => {
      let $baz = document.querySelector('[data-test="baz"]');

      await assert((await I.find($baz)) === $baz,
        'Expected to resolve the "Baz" element');
    });

    it('does not accept an invalid selector', async () => {
      await assert.throws(() => I.find('$(.bar) ::baz'),
        'Invalid selector: $(.bar) ::baz');
    });

    it('uses the selector in error messages', async () => {
      let $qux = document.querySelector('[data-test-qux]');

      await assert.throws(
        I.find('::qux').then.assert(false, '#{this} is "Qux"'),
        '::qux is "Qux"');
      await assert.throws(
        I.find(() => $qux).then.assert(false, '#{this} is "Qux"'),
        'element is "Qux"');
      await assert.throws(
        I.find($qux).then.assert(false, '#{this} is "Qux"'),
        'p element is "Qux"');
    });

    it('finds form elements by label', async () => {
      fixture(`
        <div>
          <label for="test">Foo</label>
          <input id="test" value="Bar"/>
        </div>
        <label for="nothing">Baz</label>
      `);

      await assert((await I.find('Foo')).value === 'Bar',
        'Expected to find the input associated with the label');
      await assert((await I.find('"Foo" $(label)')).control?.value === 'Bar',
        'Expected to find the label element itself');
      await assert((await I.find('Baz')).htmlFor === 'nothing',
        'Expected to find the label element without an associated input');
    });

    it('finds form elements by placeholder', async () => {
      fixture('<input placeholder="Foo"/>');

      await assert((await I.find('Foo')).placeholder === 'Foo',
        'Expected to find the "Foo" input by placeholder');
    });

    it('does not search for elements outside of the root element', async () => {
      fixture(`
        <div class="foo-root"><p>Foo</p></div>
        <div class="bar-root"><p>Bar</p></div>
      `);

      let F = new Interactor({
        root: () => document.querySelector('.foo-root'),
        assert: { timeout: 100, reliability: 0 }
      });

      await F.find('Foo');
      await assert.throws(() => F.find('Bar'),
        'Could not find "Bar"');

      let B = new Interactor({
        root: () => document.querySelector('.bar-root'),
        assert: { timeout: 100, reliability: 0 }
      });

      await B.find('Bar');
      await assert.throws(() => B.find('Foo'),
        'Could not find "Foo"');
    });

    it('uses the found element for the rest of the interaction', async () => {
      let test = I.find('Foo')
        .then.act(({ $ }) => $.innerText);

      await assert(await test === 'Foo',
        'Expected to resolve to "Foo" inner text');
    });

    it('finds subsequent elements when chained', async () => {
      let $foo = document.querySelector('p:last-child');

      await assert(await I.find('Foo').then.find('Foo') === $foo,
        'Expected to find the second "Foo" element');
    });

    describe('#times(number)', () => {
      it('creates a new assertion to expect many elements', async () => {
        await assert(I.find('Foo').times(2) instanceof Assertion,
          'Expected .times() to return an Assertion instance');

        await I.find('Foo').times(2);
        await I.find('Bar').not.times(2);

        await assert.throws(I.find('Foo').not.times(2),
          'Expected not to find "Foo" 2 times');
        await assert.throws(I.find('Bar').times(3),
          'Expected to find "Bar" 3 times');
      });
    });
  });
});

describe('Assert', () => {
  it('is accessible via the #assert property', async () => {
    await assert(
      I.assert instanceof Assert,
      'I.assert is not an Assert instance');
  });

  describe('.defineAssertion(name, assertion)', () => {
    let TestAssert, TestInteractor, T;

    beforeEach(() => {
      TestAssert = class TestAssert extends Assert {};
      TestInteractor = class TestInteractor extends Interactor {
        static Assert = TestAssert;
      };

      T = new TestInteractor({
        assert: { timeout: 100, reliability: 0 }
      });
    });

    it('defines an assertion', async () => {
      let pass = false;

      TestAssert.defineAssertion('test', b => {
        return pass = b;
      });

      await assert(typeof T.assert.test === 'function',
        'Expected test to be a function');
      await assert(T.assert.test(true) instanceof Assertion,
        'Expected test to return an Interaction instance');
      await assert(!pass,
        'Expected test not to pass');
      await assert(await T.assert.test(true) === true,
        'Expected test assertion to resolve true');
      await assert(pass,
        'Expected test to pass');
    });

    it('accepts failure and negated messages', async () => {
      TestAssert.defineAssertion('test',
        b => b,
        'Failure message',
        'Negated message'
      );

      await assert(typeof T.assert.test === 'function',
        'Expected test to be a function');
      await assert(T.assert.test(true) instanceof Assertion,
        'Expected test to return an Interaction instance');
      await assert.throws(T.assert.test(false),
        'Failure message');
      await assert.throws(T.assert.not.test(true),
        'Negated message');
    });

    it('accepts an assertion object', async () => {
      TestAssert.defineAssertion('test', {
        assertion: b => b,
        failureMessage: 'Failure message',
        negatedMessage: 'Negated message'
      });

      await assert(typeof T.assert.test === 'function',
        'Expected test to be a function');
      await assert(T.assert.test(true) instanceof Assertion,
        'Expected test to return an Interaction instance');
      await assert.throws(T.assert.test(false),
        'Failure message');
      await assert.throws(T.assert.not.test(true),
        'Negated message');
    });

    it('accepts an assertion that returns an assertion object', async () => {
      TestAssert.defineAssertion('test', (expected, msg) => ({
        assertion: expected === true,
        failureMessage: `Failure message (${msg})`,
        negatedMessage: `Negated message (${msg})`
      }));

      await assert(typeof T.assert.test === 'function',
        'Expected test to be a function');
      await assert(T.assert.test(true) instanceof Assertion,
        'Expected test to return an Interaction instance');
      await assert.throws(T.assert.test(false, 'foo'),
        'Failure message (foo)');
      await assert.throws(T.assert.not.test(true, 'bar'),
        'Negated message (bar)');
    });

    it('accepts an assertion class', async () => {
      let pass = false;

      class TestAssertion extends Assertion {
        constructor(b) { super(() => pass = b); }
      }

      TestAssert.defineAssertion('test', TestAssertion);

      await assert(typeof T.assert.test === 'function',
        'Expected test to be a function');
      await assert(T.assert.test(true) instanceof TestAssertion,
        'Expected test to return an TestInteraction instance');
      await assert(!pass,
        'Expected test not to pass');
      await assert(await T.assert.test(true) === true,
        'Expected test assertion to resolve true');
      await assert(pass,
        'Expected test to pass');
    });
  });

  describe('.defineAssertions(assertions)', () => {
    it('calls .defineAssertion() for every assertion', async () => {
      let calls = [];

      class TestAssert extends Assert {
        static defineAssertion(...args) {
          calls.push(args);
          return this;
        }
      }

      let foo = () => {};
      let bar = { assertion: () => {} };
      let baz = class TestAssertion extends Assertion {};
      TestAssert.defineAssertions({ foo, bar, baz });

      await assert(calls.length === 3,
        'Expected .defineAssertion() to be called 3 times');
      await assert(calls[0][0] === 'foo' && calls[0][1] === foo,
        'Expected .defineAssertion() to be called with foo');
      await assert(calls[1][0] === 'bar' && calls[1][1] === bar,
        'Expected .defineAssertion() to be called with bar');
      await assert(calls[2][0] === 'baz' && calls[2][1] === baz,
        'Expected .defineAssertion() to be called with baz');
    });
  });

  describe('#not', () => {
    it('negates the following assertion', async () => {
      await I.assert.not(false);
      await I.assert.not(() =>
        Promise.reject(new Error('test')));
      await I.assert.not(new Assertion({
        assertion: () => false
      }));

      await assert.throws(
        I.assert.not(() => true),
        'Expected assertion to fail');
      await assert.throws(
        I.assert.not(true, 'But is true'),
        'But is true');
      await assert.throws(
        I.assert.not(new Assertion({
          assertion: () => true,
          negatedMessage: 'But is true'
        })),
        'But is true');
    });

    it('cannot be used more than once for an assertion', async () => {
      await assert.throws(
        () => I.assert.not.not,
        'Double negative');
    });
  });
});
