import { assert, e, fixture } from 'tests/helpers';
import Interactor from 'interactor.js';

describe('Properties: focused', () => {
  const Test = Interactor.extend({
    interactor: {
      timeout: 50
    }
  });

  beforeEach(() => {
    fixture(`
      <input class="input-a"/>
      <input class="input-b"/>
    `);

    document.querySelector('.input-a').focus();
  });

  it('returns a boolean value reflecting the element\'s focused state', () => {
    assert.equal(Test('.input-a').focused, true);
    assert.equal(Test('.input-b').focused, false);
  });

  it('throws an error when the element does not exist', () => {
    assert.throws(
      () => Test('.input-c').focused,
      e('InteractorError', 'could not find .input-c')
    );
  });

  describe('assert', () => {
    it('passes when the input is focused', async () => {
      await assert.doesNotReject(
        Test('.input-a').assert.focused()
      );
    });

    it('fails when the input is not focused', async () => {
      await assert.rejects(
        Test('.input-b').assert.focused(),
        e('InteractorError', '.input-b is not focused')
      );
    });

    describe('negated', () => {
      it('fails when the input is focused', async () => {
        await assert.rejects(
          Test('.input-a').assert.not.focused(),
          e('InteractorError', '.input-a is focused')
        );
      });

      it('passes when the input is not focused', async () => {
        await assert.doesNotReject(
          Test('.input-b').assert.not.focused()
        );
      });
    });

    describe('nested', () => {
      const Test = Interactor.extend({
        interactor: {
          timeout: 50
        },

        assert: {
          focused(expected, ab) {
            this[ab].assert.focused();
          }
        },

        a: Interactor('.input-a'),
        b: Interactor('.input-b')
      });

      it('works as expected when called via nested methods', async () => {
        await assert.doesNotReject(
          Test()
            .assert.a.focused()
            .assert.b.not.focused()
        );

        await assert.rejects(
          Test().assert.a.not.focused(),
          e('InteractorError', '.input-a is focused')
        );

        await assert.rejects(
          Test().assert.b.focused(),
          e('InteractorError', '.input-b is not focused')
        );
      });

      it('can be overridden', async () => {
        await assert.doesNotReject(
          Test()
            .assert.focused('a')
            .assert.not.focused('b')
        );

        await assert.rejects(
          Test().assert.not.focused('a'),
          e('InteractorError', '.input-a is focused')
        );

        await assert.rejects(
          Test().assert.focused('b'),
          e('InteractorError', '.input-b is not focused')
        );
      });
    });
  });
});
