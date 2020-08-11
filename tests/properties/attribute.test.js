import { assert, e, fixture } from 'tests/helpers';
import Interactor, { attribute } from 'interactor.js';

describe('Properties: attribute', () => {
  const Test = Interactor.extend({
    interactor: {
      timeout: 50
    }
  });

  beforeEach(() => {
    fixture(`
      <div class="foo" data-test="bar"></div>
      <div class="bar" id="baz"></div>
    `);
  });

  it('returns the element\'s specified attribute', () => {
    assert.equal(Test('.foo').attribute('data-test'), 'bar');
    assert.equal(Test('.bar').attribute('id'), 'baz');
  });

  it('throws an error when the element does not exist', () => {
    assert.throws(
      () => Test('.baz').attribute('class'),
      e('InteractorError', 'could not find .baz')
    );
  });

  describe('assert', () => {
    it('passes when the attribute matches', async () => {
      await assert.doesNotReject(
        Test('.foo').assert.attribute('data-test', 'bar')
      );
    });

    it('fails when the attribute does not match', async () => {
      await assert.rejects(
        Test('.bar').assert.attribute('id', 'bar'),
        e('InteractorError', '.bar id is "baz" but expected "bar"')
      );
    });

    describe('negated', () => {
      it('fails when the attribute matches', async () => {
        await assert.rejects(
          Test('.foo').assert.not.attribute('data-test', 'bar'),
          e('InteractorError', '.foo data-test is "bar" but expected it not to be')
        );
      });

      it('passes when the attribute does not match', async () => {
        await assert.doesNotReject(
          Test('.bar').assert.not.attribute('id', 'foo')
        );
      });
    });

    describe('nested', () => {
      const Test = Interactor.extend({
        interactor: {
          timeout: 50
        },

        assert: {
          attribute(expected, foobar, attr, val) {
            this[foobar].assert.attribute(attr, val);
          }
        },

        foo: Interactor('.foo'),
        bar: Interactor('.bar')
      });

      it('works as expected when called via nested methods', async () => {
        await assert.doesNotReject(
          Test()
            .assert.foo.attribute('data-test', 'bar')
            .assert.foo.not.attribute('id')
            .assert.bar.attribute('id', 'baz')
            .assert.bar.not.attribute('data-test')
        );

        await assert.rejects(
          Test().assert.foo.not.attribute('data-test', 'bar'),
          e('InteractorError', '.foo data-test is "bar" but expected it not to be')
        );

        await assert.rejects(
          Test().assert.bar.attribute('data-test', 'baz'),
          e('InteractorError', '.bar data-test is "null" but expected "baz"')
        );
      });

      it('can be overridden', async () => {
        await assert.doesNotReject(
          Test()
            .assert.attribute('foo', 'data-test', 'bar')
            .assert.attribute('bar', 'id', 'baz')
            .assert.not.attribute('foo', 'id', 'bar')
            .assert.not.attribute('bar', 'data-test', 'foo')
        );

        await assert.rejects(
          Test().assert.not.attribute('foo', 'data-test', 'bar'),
          e('InteractorError', '.foo data-test is "bar" but expected it not to be')
        );

        await assert.rejects(
          Test().assert.attribute('bar', 'id', 'qux'),
          e('InteractorError', '.bar id is "baz" but expected "qux"')
        );
      });
    });
  });

  describe('property creator', () => {
    const Test = Interactor.extend({
      interactor: {
        timeout: 50
      },

      data: attribute('data-test')
    });

    it('creates a parent bound property', () => {
      assert.equal(Test('.foo').data, 'bar');
    });

    it('creates an associated parent bound assertion', async () => {
      await assert.doesNotReject(
        Test('.foo')
          .assert.data('bar')
          .assert.not.data('baz')
      );

      await assert.rejects(
        Test('.foo').assert.data('baz'),
        e('InteractorError', '.foo data-test is "bar" but expected "baz"')
      );

      await assert.rejects(
        Test('.foo').assert.not.data('bar'),
        e('InteractorError', '.foo data-test is "bar" but expected it not to be')
      );
    });

    describe('with a selector', () => {
      const Test = Interactor.extend({
        interactor: {
          timeout: 50
        },

        foo: attribute('.foo', 'data-test')
      });

      it('creates a scoped bound property', () => {
        assert.equal(Test().foo, 'bar');
      });

      it('creates an associated scoped bound assertion', async () => {
        await assert.doesNotReject(
          Test()
            .assert.foo('bar')
            .assert.not.foo('baz')
        );

        await assert.rejects(
          Test().assert.foo('baz'),
          e('InteractorError', '.foo data-test is "bar" but expected "baz"')
        );

        await assert.rejects(
          Test().assert.not.foo('bar'),
          e('InteractorError', '.foo data-test is "bar" but expected it not to be')
        );
      });
    });
  });
});
