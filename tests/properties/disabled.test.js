import { assert, e, fixture } from 'tests/helpers';
import Interactor from 'interactor.js';

describe('Properties: disabled', () => {
  const Test = Interactor.extend({
    interactor: {
      timeout: 50
    }
  });

  beforeEach(() => {
    fixture(`
      <button class="btn-a" disabled></button>
      <button class="btn-b"></button>
    `);
  });

  it('returns a boolean value reflecting the element\'s disabled state', () => {
    assert.equal(Test('.btn-a').disabled, true);
    assert.equal(Test('.btn-b').disabled, false);
  });

  it('throws an error when the element does not exist', () => {
    assert.throws(
      () => Test('.btn-c').disabled,
      e('InteractorError', 'could not find .btn-c')
    );
  });

  describe('assert', () => {
    it('passes when the button is disabled', async () => {
      await assert.doesNotReject(
        Test('.btn-a').assert.disabled()
      );
    });

    it('fails when the button is not disabled', async () => {
      await assert.rejects(
        Test('.btn-b').assert.disabled(),
        e('InteractorError', '.btn-b is not disabled')
      );
    });

    describe('negated', () => {
      it('fails when the button is disabled', async () => {
        await assert.rejects(
          Test('.btn-a').assert.not.disabled(),
          e('InteractorError', '.btn-a is disabled')
        );
      });

      it('passes when the button is not disabled', async () => {
        await assert.doesNotReject(
          Test('.btn-b').assert.not.disabled()
        );
      });
    });

    describe('nested', () => {
      const Test = Interactor.extend({
        interactor: {
          timeout: 50
        },

        assert: {
          disabled(expected, ab) {
            this[ab].assert.disabled();
          }
        },

        a: Interactor('.btn-a'),
        b: Interactor('.btn-b')
      });

      it('works as expected when called via nested methods', async () => {
        await assert.doesNotReject(
          Test()
            .assert.a.disabled()
            .assert.b.not.disabled()
        );

        await assert.rejects(
          Test().assert.a.not.disabled(),
          e('InteractorError', '.btn-a is disabled')
        );

        await assert.rejects(
          Test().assert.b.disabled(),
          e('InteractorError', '.btn-b is not disabled')
        );
      });

      it('can be overridden', async () => {
        await assert.doesNotReject(
          Test()
            .assert.disabled('a')
            .assert.not.disabled('b')
        );

        await assert.rejects(
          Test().assert.not.disabled('a'),
          e('InteractorError', '.btn-a is disabled')
        );

        await assert.rejects(
          Test().assert.disabled('b'),
          e('InteractorError', '.btn-b is not disabled')
        );
      });
    });
  });
});
