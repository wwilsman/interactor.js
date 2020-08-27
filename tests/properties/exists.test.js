import { assert, e, fixture } from 'tests/helpers';
import Interactor, { exists } from 'interactor.js';

describe('Properties: exists', () => {
  const Test = Interactor.extend({ timeout: 50 }, {});

  beforeEach(() => {
    fixture(`
      <div class="foo"></div>
    `);
  });

  it('returns a boolean value reflecting the element\'s existence', () => {
    assert.equal(Test('.foo').exists, true);
    assert.equal(Test('.bar').exists, false);
  });

  describe('assert', () => {
    it('passes when the element exists', async () => {
      await assert.doesNotReject(
        Test('.foo').assert.exists()
      );
    });

    it('fails when the element does not exist', async () => {
      await assert.rejects(
        Test('.bar').assert.exists(),
        e('InteractorError', '.bar does not exist')
      );
    });

    describe('negated', () => {
      it('fails when the element exists', async () => {
        await assert.rejects(
          Test('.foo').assert.not.exists(),
          e('InteractorError', '.foo exists')
        );
      });

      it('passes when the element does not exist', async () => {
        await assert.doesNotReject(
          Test('.bar').assert.not.exists()
        );
      });
    });

    describe('nested', () => {
      const Test = Interactor.extend({ timeout: 50 }, {
        assert: {
          exists(expected, foobar) {
            this[foobar].assert.exists();
          }
        },

        foo: Interactor('.foo'),
        bar: Interactor('.bar')
      });

      it('works as expected when called via nested methods', async () => {
        await assert.doesNotReject(
          Test()
            .assert.foo.exists()
            .assert.bar.not.exists()
        );

        await assert.rejects(
          Test().assert.foo.not.exists(),
          e('InteractorError', '.foo exists')
        );

        await assert.rejects(
          Test().assert.bar.exists(),
          e('InteractorError', '.bar does not exist')
        );
      });

      it('can be overridden', async () => {
        await assert.doesNotReject(
          Test()
            .assert.exists('foo')
            .assert.not.exists('bar')
        );

        await assert.rejects(
          Test().assert.not.exists('foo'),
          e('InteractorError', '.foo exists')
        );

        await assert.rejects(
          Test().assert.exists('bar'),
          e('InteractorError', '.bar does not exist')
        );
      });
    });
  });

  describe('property creator', () => {
    const Test = Interactor.extend({ timeout: 50 }, {
      there: exists()
    });

    it('creates a parent bound property', () => {
      assert.equal(Test('.foo').there, true);
      assert.equal(Test('.bar').there, false);
    });

    it('creates an associated parent bound assertion', async () => {
      await assert.doesNotReject(
        Test('.foo').assert.there()
      );

      await assert.doesNotReject(
        Test('.bar').assert.not.there()
      );

      await assert.rejects(
        Test('.foo').assert.not.there(),
        e('InteractorError', '.foo exists')
      );

      await assert.rejects(
        Test('.bar').assert.there(),
        e('InteractorError', '.bar does not exist')
      );
    });

    describe('with a selector', () => {
      const Test = Interactor.extend({ timeout: 50 }, {
        foo: exists('.foo'),
        bar: exists('.bar')
      });

      it('creates a scoped bound property', () => {
        assert.equal(Test().foo, true);
        assert.equal(Test().bar, false);
      });

      it('creates an associated scoped bound assertion', async () => {
        await assert.doesNotReject(
          Test()
            .assert.foo()
            .assert.not.bar()
        );

        await assert.rejects(
          Test().assert.not.foo(),
          e('InteractorError', '.foo exists')
        );

        await assert.rejects(
          Test().assert.bar(),
          e('InteractorError', '.bar does not exist')
        );
      });

      it('can be awaited on for the value', async () => {
        assert.equal(await exists('.foo'), true);
        assert.equal(await exists('.bar'), false);
      });
    });
  });
});
