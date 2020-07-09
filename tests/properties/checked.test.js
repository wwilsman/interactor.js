import { assert, e, fixture } from 'tests/helpers';
import Interactor from 'interactor.js';

describe('Properties: checked', () => {
  const Test = Interactor.extend({
    interactor: {
      timeout: 50
    }
  });

  beforeEach(() => {
    fixture(`
      <input type="checkbox" class="check-a" checked/>
      <input type="checkbox" class="check-b"/>
    `);
  });

  it('returns a boolean value reflecting the element\'s checked state', () => {
    assert.equal(Test('.check-a').checked, true);
    assert.equal(Test('.check-b').checked, false);
  });

  it('throws an error when the element does not exist', () => {
    assert.throws(
      () => Test('.check-c').checked,
      e('InteractorError', 'could not find .check-c')
    );
  });

  describe('assert', () => {
    it('passes when the input is checked', async () => {
      await assert.doesNotReject(
        Test('.check-a').assert.checked()
      );
    });

    it('fails when the input is not checked', async () => {
      await assert.rejects(
        Test('.check-b').assert.checked(),
        e('InteractorError', '.check-b is not checked')
      );
    });

    describe('negated', () => {
      it('fails when the input is checked', async () => {
        await assert.rejects(
          Test('.check-a').assert.not.checked(),
          e('InteractorError', '.check-a is checked')
        );
      });

      it('passes when the input is not checked', async () => {
        await assert.doesNotReject(
          Test('.check-b').assert.not.checked()
        );
      });
    });

    describe('nested', () => {
      const Test = Interactor.extend({
        interactor: {
          timeout: 50
        },

        assert: {
          checked(expected, ab) {
            this[ab].assert.checked();
          }
        },

        a: Interactor('.check-a'),
        b: Interactor('.check-b')
      });

      it('works as expected when called via nested methods', async () => {
        await assert.doesNotReject(
          Test()
            .assert.a.checked()
            .assert.b.not.checked()
        );

        await assert.rejects(
          Test().assert.a.not.checked(),
          e('InteractorError', '.check-a is checked')
        );

        await assert.rejects(
          Test().assert.b.checked(),
          e('InteractorError', '.check-b is not checked')
        );
      });

      it('can be overridden', async () => {
        await assert.doesNotReject(
          Test()
            .assert.checked('a')
            .assert.not.checked('b')
        );

        await assert.rejects(
          Test().assert.not.checked('a'),
          e('InteractorError', '.check-a is checked')
        );

        await assert.rejects(
          Test().assert.checked('b'),
          e('InteractorError', '.check-b is not checked')
        );
      });
    });
  });
});
