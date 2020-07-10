import { assert, e, fixture } from 'tests/helpers';
import Interactor from 'interactor.js';

describe('Properties: count', () => {
  const Test = Interactor.extend({
    interactor: {
      timeout: 50
    }
  });

  beforeEach(() => {
    fixture(`
      <ul class="list-a">
        <li></li>
      </ul>
      <ul class="list-b">
        <li></li>
        <li></li>
        <li></li>
      </ul>
      <ul class="list-c"></ul>
    `);
  });

  it('returns the number of element\'s within the interactor', () => {
    assert.equal(Test('.list-a').count('li'), 1);
    assert.equal(Test('.list-b').count('li'), 3);
    assert.equal(Test('.list-c').count('li'), 0);
  });

  it('throws an error when the element does not exist', () => {
    assert.throws(
      () => Test('.list-d').count('li'),
      e('InteractorError', 'could not find .list-d')
    );
  });

  describe('assert', () => {
    it('passes when the count is accurate', async () => {
      await assert.doesNotReject(
        Test('.list-a').assert.count('li', 1)
      );

      await assert.doesNotReject(
        Test('.list-b').assert.count('li', 3)
      );

      await assert.doesNotReject(
        Test('.list-c').assert.count('li', 0)
      );
    });

    it('fails when the count is not accurate', async () => {
      await assert.rejects(
        Test('.list-a').assert.count('li', 3),
        e('InteractorError', 'found 1 element matching li within .list-a but expected 3')
      );

      await assert.rejects(
        Test('.list-b').assert.count('li', 0),
        e('InteractorError', 'found 3 elements matching li within .list-b but expected 0')
      );

      await assert.rejects(
        Test('.list-c').assert.count('li', 1),
        e('InteractorError', 'found 0 elements matching li within .list-c but expected 1')
      );
    });

    describe('negated', () => {
      it('fails when the count is accurate', async () => {
        await assert.rejects(
          Test('.list-a').assert.not.count('li', 1),
          e('InteractorError', 'found 1 element matching li within .list-a but expected not to')
        );

        await assert.rejects(
          Test('.list-b').assert.not.count('li', 3),
          e('InteractorError', 'found 3 elements matching li within .list-b but expected not to')
        );

        await assert.rejects(
          Test('.list-c').assert.not.count('li', 0),
          e('InteractorError', 'found 0 elements matching li within .list-c but expected not to')
        );
      });

      it('passes when the count is not accurate', async () => {
        await assert.doesNotReject(
          Test('.list-a').assert.not.count('li', 0)
        );

        await assert.doesNotReject(
          Test('.list-b').assert.not.count('li', 1)
        );

        await assert.doesNotReject(
          Test('.list-c').assert.not.count('li', 3)
        );
      });
    });

    describe('nested', () => {
      const Test = Interactor.extend({
        interactor: {
          timeout: 50
        },

        assert: {
          count(expected, ab, sel, n) {
            this[ab].assert.count(sel, n);
          }
        },

        a: Interactor('.list-a'),
        b: Interactor('.list-b'),
        c: Interactor('.list-c')
      });

      it('works as expected when called via nested methods', async () => {
        await assert.doesNotReject(
          Test()
            .assert.a.count('li', 1)
            .assert.a.not.count('li', 2)
            .assert.b.count('li', 3)
            .assert.b.not.count('li', 4)
            .assert.c.count('li', 0)
            .assert.c.not.count('li', 1)
        );

        await assert.rejects(
          Test().assert.a.not.count('li', 1),
          e('InteractorError', 'found 1 element matching li within .list-a but expected not to')
        );

        await assert.rejects(
          Test().assert.b.count('li', 0),
          e('InteractorError', 'found 3 elements matching li within .list-b but expected 0')
        );
      });

      it('can be overridden', async () => {
        await assert.doesNotReject(
          Test()
            .assert.count('a', 'li', 1)
            .assert.not.count('a', 'li', 2)
            .assert.count('b', 'li', 3)
            .assert.not.count('b', 'li', 4)
            .assert.count('c', 'li', 0)
            .assert.not.count('c', 'li', 1)
        );

        await assert.rejects(
          Test().assert.not.count('a', 'li', 1),
          e('InteractorError', 'found 1 element matching li within .list-a but expected not to')
        );

        await assert.rejects(
          Test().assert.count('b', 'li', 1),
          e('InteractorError', 'found 3 elements matching li within .list-b but expected 1')
        );
      });
    });
  });
});
