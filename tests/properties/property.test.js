import { assert, e, fixture, jsdom, mockConsole } from '../helpers.js';
import I from 'interactor.js';

describe('Properties: property', () => {
  const Test = I.extend({ timeout: 50 }, {});

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
          '`I.suppressLayoutEngineWarning = true`'
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
      const Test = I.extend({ timeout: 50 }, {
        assert: {
          property(expected, foobar, prop, val) {
            this[foobar].assert.property(prop, val);
          }
        },

        foo: I('.foo'),
        para: I('.para')
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

  describe('property creator', () => {
    const Test = I.extend({ timeout: 50 }, {
      title: I.property('title'),
      tagName: I.property('tagName')
    });

    it('creates a parent bound property', () => {
      assert.equal(Test('.foo').title, 'bar');
      assert.equal(Test('.para').tagName, 'P');
    });

    it('creates an associated parent bound assertion', async () => {
      await assert.doesNotReject(
        Test('.foo')
          .assert.title('bar')
          .assert.not.title('baz')
      );

      await assert.doesNotReject(
        Test('.para')
          .assert.tagName('P')
          .assert.not.tagName('DIV')
      );

      await assert.rejects(
        Test('.foo').assert.not.title('bar'),
        e('InteractorError', '.foo title is "bar" but expected it not to be')
      );

      await assert.rejects(
        Test('.para').assert.tagName('DIV'),
        e('InteractorError', '.para tagName is "P" but expected "DIV"')
      );
    });

    describe('with a selector', () => {
      const Test = I.extend({ timeout: 50 }, {
        foo: I.property('.foo', 'title'),
        para: I.property('.para', 'tagName')
      });

      it('creates a scoped bound property', () => {
        assert.equal(Test().foo, 'bar');
        assert.equal(Test().para, 'P');
      });

      it('creates an associated scoped bound assertion', async () => {
        await assert.doesNotReject(
          Test()
            .assert.foo('bar')
            .assert.para('P')
            .assert.not.foo('baz')
            .assert.not.para('DIV')
        );

        await assert.rejects(
          Test().assert.foo('baz'),
          e('InteractorError', '.foo title is "bar" but expected "baz"')
        );

        await assert.rejects(
          Test().assert.not.para('P'),
          e('InteractorError', '.para tagName is "P" but expected it not to be')
        );
      });

      it('can be awaited on for the value', async () => {
        await assert.rejects(I.property('title'), (
          e('InteractorError', 'an element selector is required when awaiting on properties')
        ));

        assert.equal(await I.property('.foo', 'title'), 'bar');
      });
    });
  });
});
