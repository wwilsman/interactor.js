import { assert, e, fixture } from 'tests/helpers';
import I from 'interactor.js';

describe('Properties: count', () => {
  const Test = I.extend({ timeout: 50 }, {});

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

  it('returns the number of instance elements without a selector', () => {
    assert.equal(Test('li').count(), 4);
    assert.equal(Test('.list-b').find('li').count(), 3);
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

      await assert.doesNotReject(
        Test('li').assert.count(4)
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

      await assert.rejects(
        Test('li').assert.count(5),
        e('InteractorError', 'found 4 elements matching li but expected 5')
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

        await assert.rejects(
          Test('li').assert.not.count(4),
          e('InteractorError', 'found 4 elements matching li but expected not to')
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

        await assert.doesNotReject(
          Test('li').assert.not.count(5)
        );
      });
    });

    describe('nested', () => {
      const Test = I.extend({ timeout: 50 }, {
        assert: {
          count(expected, ab, ...args) {
            this[ab].assert.count(...args);
          }
        },

        a: I('.list-a'),
        b: I('.list-b'),
        c: I('.list-c'),
        item: I('li')
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
            .assert.item.count(4)
            .assert.item.not.count(5)
        );

        await assert.rejects(
          Test().assert.a.not.count('li', 1),
          e('InteractorError', 'found 1 element matching li within .list-a but expected not to')
        );

        await assert.rejects(
          Test().assert.b.count('li', 0),
          e('InteractorError', 'found 3 elements matching li within .list-b but expected 0')
        );

        await assert.rejects(
          Test().assert.item.count(2),
          e('InteractorError', 'found 4 elements matching li but expected 2')
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
            .assert.count('item', 4)
            .assert.not.count('item', 1)
        );

        await assert.rejects(
          Test().assert.not.count('a', 'li', 1),
          e('InteractorError', 'found 1 element matching li within .list-a but expected not to')
        );

        await assert.rejects(
          Test().assert.count('b', 'li', 1),
          e('InteractorError', 'found 3 elements matching li within .list-b but expected 1')
        );

        await assert.rejects(
          Test().assert.count('item', 1),
          e('InteractorError', 'found 4 elements matching li but expected 1')
        );
      });
    });
  });

  describe('property creator', () => {
    const Test = I.extend({ timeout: 50 }, {
      length: I.count('li'),
      amount: I.count()
    });

    it('creates a parent bound property', () => {
      assert.equal(Test('.list-a').length, 1);
      assert.equal(Test('.list-b').length, 3);
      assert.equal(Test('.list-c').length, 0);
      assert.equal(Test('li').amount, 4);
    });

    it('creates an associated parent bound assertion', async () => {
      await assert.doesNotReject(
        Test('.list-b')
          .assert.length(3)
          .assert.not.length(1)
      );

      await assert.doesNotReject(
        Test('li')
          .assert.amount(4)
          .assert.not.amount(5)
      );

      await assert.rejects(
        Test('.list-c').assert.length(2),
        e('InteractorError', 'found 0 elements matching li within .list-c but expected 2')
      );

      await assert.rejects(
        Test('.list-a').assert.not.length(1),
        e('InteractorError', 'found 1 element matching li within .list-a but expected not to')
      );

      await assert.rejects(
        Test('li').assert.amount(3),
        e('InteractorError', 'found 4 elements matching li but expected 3')
      );
    });

    describe('with a selector', () => {
      const Test = I.extend({ timeout: 50 }, {
        a: I.count('.list-a', 'li'),
        b: I.count('.list-b', 'li'),
        c: I.count('.list-c', 'li')
      });

      it('creates a scoped bound property', () => {
        assert.equal(Test().a, 1);
        assert.equal(Test().b, 3);
        assert.equal(Test().c, 0);
      });

      it('creates an associated scoped bound assertion', async () => {
        await assert.doesNotReject(
          Test()
            .assert.a(1)
            .assert.b(3)
            .assert.c(0)
            .assert.not.a(3)
            .assert.not.b(0)
            .assert.not.c(1)
        );

        await assert.rejects(
          Test().assert.a(3),
          e('InteractorError', 'found 1 element matching li within .list-a but expected 3')
        );

        await assert.rejects(
          Test().assert.not.b(3),
          e('InteractorError', 'found 3 elements matching li within .list-b but expected not to')
        );
      });

      it('can be awaited on for the value', async () => {
        assert.equal(await I.count('.list-a', 'li'), 1);
        assert.equal(await I.count('.list-b', 'li'), 3);
        assert.equal(await I.count('.list-c', 'li'), 0);
        assert.equal(await I.count('li'), 4);
      });
    });
  });
});
