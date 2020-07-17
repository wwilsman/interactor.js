import { assert, e, fixture, jsdom, mockConsole } from 'tests/helpers';
import Interactor from 'interactor.js';

describe('Properties: property', () => {
  const Test = Interactor.extend({
    interactor: {
      timeout: 50
    }
  });

  beforeEach(() => {
    fixture(`
      <div class="foo" title="bar"></div>
      <p class="para"></p>
    `);
  });

  it('returns the element\'s specified property', () => {
    assert.equal(Test('.foo').property('title'), 'bar');
    assert.equal(Test('.para').property('tagName'), 'P');
  });

  it('throws an error when the element does not exist', () => {
    assert.throws(
      () => Test('.bar').property('title'),
      e('InteractorError', 'could not find .bar')
    );
  });

  if (jsdom()) {
    describe('jsdom', () => {
      const mock = mockConsole();
      const LAYOUT_PROPS = [
        'scrollTop',
        'scrollLeft',
        'scrollWidth',
        'scrollHeight',
        'clientTop',
        'clientLeft',
        'clientWidth',
        'clientHeight'
      ];

      it('logs a warning about the layout engine for specific properties', async () => {
        for (let prop of LAYOUT_PROPS) {
          assert.equal(Test('.foo').property(prop), 0);
          // wait for the warning to finish debouncing
          await new Promise(r => setTimeout(r, 100));
        }

        assert.equal(mock.warn.calls.length, LAYOUT_PROPS.length);
        assert.equal(mock.warn.calls[0], [
          'No layout engine detected.',
          'Layout as a result of CSS cannot be determined.',
          'You can disable this warning by setting',
          '`Interactor.suppressLayoutEngineWarning = true`'
        ].join(' '));
      });
    });
  }

  describe('assert', () => {
    it('passes when the property matches', async () => {
      await assert.doesNotReject(
        Test('.foo').assert.property('title', 'bar')
      );
    });

    it('fails when the property does not match', async () => {
      await assert.rejects(
        Test('.para').assert.property('tagName', 'DIV'),
        e('InteractorError', '.para tagName is "P" but expected "DIV"')
      );
    });

    describe('negated', () => {
      it('fails when the property matches', async () => {
        await assert.rejects(
          Test('.foo').assert.not.property('title', 'bar'),
          e('InteractorError', '.foo title is "bar" but expected it not to be')
        );
      });

      it('passes when the property does not match', async () => {
        await assert.doesNotReject(
          Test('.para').assert.not.property('tagName', 'DIV')
        );
      });
    });

    describe('nested', () => {
      const Test = Interactor.extend({
        interactor: {
          timeout: 50
        },

        assert: {
          property(expected, foobar, prop, val) {
            this[foobar].assert.property(prop, val);
          }
        },

        foo: Interactor('.foo'),
        para: Interactor('.para')
      });

      it('works as expected when called via nested methods', async () => {
        await assert.doesNotReject(
          Test()
            .assert.foo.property('title', 'bar')
            .assert.foo.not.property('tagName', 'P')
            .assert.para.property('tagName', 'P')
            .assert.para.not.property('title')
        );

        await assert.rejects(
          Test().assert.foo.not.property('title', 'bar'),
          e('InteractorError', '.foo title is "bar" but expected it not to be')
        );

        await assert.rejects(
          Test().assert.para.property('title', 'baz'),
          e('InteractorError', '.para title is "" but expected "baz"')
        );
      });

      it('can be overridden', async () => {
        await assert.doesNotReject(
          Test()
            .assert.property('foo', 'title', 'bar')
            .assert.property('para', 'tagName', 'P')
            .assert.not.property('foo', 'tagName', 'P')
            .assert.not.property('para', 'title', 'foo')
        );

        await assert.rejects(
          Test().assert.not.property('foo', 'title', 'bar'),
          e('InteractorError', '.foo title is "bar" but expected it not to be')
        );

        await assert.rejects(
          Test().assert.property('para', 'tagName', 'SPAN'),
          e('InteractorError', '.para tagName is "P" but expected "SPAN"')
        );
      });
    });
  });
});
