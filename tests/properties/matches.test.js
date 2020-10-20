import { assert, e, fixture } from 'tests/helpers';
import I from 'interactor.js';

describe('Properties: matches', () => {
  const Test = I.extend({ timeout: 50 }, {});

  beforeEach(() => {
    fixture(`
      <div class="div foo"></div>
    `);
  });

  it('returns a boolean value reflecting if the element matches the selector', () => {
    assert.equal(Test('.div').matches('.foo'), true);
    assert.equal(Test('.div').matches('.bar'), false);
  });

  it('throws an error when the element does not exist', () => {
    assert.throws(
      () => Test('.bar').matches('.foo'),
      e('InteractorError', 'could not find .bar')
    );
  });

  describe('assert', () => {
    it('passes when the element matches the selected', async () => {
      await assert.doesNotReject(
        Test('.div').assert.matches('.foo')
      );
    });

    it('fails when the element does not match the selector', async () => {
      await assert.rejects(
        Test('.div').assert.matches('.bar'),
        e('InteractorError', '.div does not match .bar')
      );
    });

    describe('negated', () => {
      it('fails when the element matches the selector', async () => {
        await assert.rejects(
          Test('.div').assert.not.matches('.foo'),
          e('InteractorError', '.div matches .foo but expected it not to')
        );
      });

      it('passes when the element does not match the selector', async () => {
        await assert.doesNotReject(
          Test('.div').assert.not.matches('.bar')
        );
      });
    });

    describe('nested', () => {
      const Test = I.extend({ timeout: 50 }, {
        assert: {
          matches(expected, sel) {
            this.foo.assert.matches(sel);
          }
        },

        foo: I('.div')
      });

      it('works as expected when called via nested methods', async () => {
        await assert.doesNotReject(
          Test()
            .assert.foo.matches('.foo')
            .assert.foo.not.matches('.bar')
        );

        await assert.rejects(
          Test().assert.foo.not.matches('.foo'),
          e('InteractorError', '.div matches .foo but expected it not to')
        );

        await assert.rejects(
          Test().assert.foo.matches('.bar'),
          e('InteractorError', '.div does not match .bar')
        );
      });

      it('can be overridden', async () => {
        await assert.doesNotReject(
          Test()
            .assert.matches('.foo')
            .assert.not.matches('.bar')
        );

        await assert.rejects(
          Test().assert.not.matches('.foo'),
          e('InteractorError', '.div matches .foo but expected it not to')
        );

        await assert.rejects(
          Test().assert.matches('.bar'),
          e('InteractorError', '.div does not match .bar')
        );
      });
    });
  });

  describe('property creator', () => {
    const Test = I.extend({ timeout: 50 }, {
      foo: I.matches('.foo'),
      bar: I.matches('.bar')
    });

    it('creates a parent bound property', () => {
      assert.equal(Test('.div').foo, true);
      assert.equal(Test('.div').bar, false);
    });

    it('creates an associated parent bound assertion', async () => {
      await assert.doesNotReject(
        Test('.div')
          .assert.foo()
          .assert.not.bar()
      );

      await assert.rejects(
        Test('.div').assert.bar(),
        e('InteractorError', '.div does not match .bar')
      );

      await assert.rejects(
        Test('.div').assert.not.foo(),
        e('InteractorError', '.div matches .foo but expected it not to')
      );
    });

    describe('with a selector', () => {
      const Test = I.extend({ timeout: 50 }, {
        foo: I.matches('.div', '.foo'),
        bar: I.matches('.div', '.bar')
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
          Test().assert.bar(),
          e('InteractorError', '.div does not match .bar')
        );

        await assert.rejects(
          Test().assert.not.foo(),
          e('InteractorError', '.div matches .foo but expected it not to')
        );
      });

      it('can be awaited on for the value', async () => {
        await assert.rejects(
          I.matches('.foo'),
          e('InteractorError', 'an element selector is required when awaiting on properties')
        );

        assert.equal(await I.matches('.div', '.foo'), true);
      });
    });
  });
});
