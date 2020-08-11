import { assert, e, fixture } from 'tests/helpers';
import Interactor, { value } from 'interactor.js';

describe('Properties: value', () => {
  const Test = Interactor.extend({
    interactor: {
      timeout: 50
    }
  });

  beforeEach(() => {
    fixture(`
      <input class="input-a" value="A"/>
      <input class="input-b" value="B"/>
    `);
  });

  it('returns the input\'s value', () => {
    assert.equal(Test('.input-a').value, 'A');
    assert.equal(Test('.input-b').value, 'B');
  });

  it('throws an error when the input does not exist', () => {
    assert.throws(
      () => Test('.input-c').value,
      e('InteractorError', 'could not find .input-c')
    );
  });

  describe('assert', () => {
    it('passes when the value matches', async () => {
      await assert.doesNotReject(
        Test('.input-a').assert.value('A')
      );

      await assert.doesNotReject(
        Test('.input-b').assert.value(/b/i)
      );
    });

    it('fails when the value does not match', async () => {
      await assert.rejects(
        Test('.input-a').assert.value('B'),
        e('InteractorError', '.input-a value is "A" but expected "B"')
      );

      await assert.rejects(
        Test('.input-b').assert.value(/a/i),
        e('InteractorError', '.input-b value is "B" but expected "/a/i"')
      );
    });

    describe('negated', () => {
      it('fails when the value matches', async () => {
        await assert.rejects(
          Test('.input-a').assert.not.value('A'),
          e('InteractorError', '.input-a value is "A" but expected it not to be')
        );

        await assert.rejects(
          Test('.input-b').assert.not.value(/b/i),
          e('InteractorError', '.input-b value is "B" but expected it not to be')
        );
      });

      it('passes when the value does not match', async () => {
        await assert.doesNotReject(
          Test('.input-a').assert.not.value('B')
        );

        await assert.doesNotReject(
          Test('.input-b').assert.not.value(/a/i)
        );
      });
    });

    describe('nested', () => {
      const Test = Interactor.extend({
        interactor: {
          timeout: 50
        },

        assert: {
          value(expected, ab, val) {
            this[ab].assert.value(val);
          }
        },

        a: Interactor('.input-a'),
        b: Interactor('.input-b')
      });

      it('works as expected when called via nested methods', async () => {
        await assert.doesNotReject(
          Test()
            .assert.a.value('A')
            .assert.b.value(/b/i)
            .assert.a.not.value('a')
            .assert.b.not.value('A')
        );

        await assert.rejects(
          Test().assert.a.not.value('A'),
          e('InteractorError', '.input-a value is "A" but expected it not to be')
        );

        await assert.rejects(
          Test().assert.b.value(/a/i),
          e('InteractorError', '.input-b value is "B" but expected "/a/i"')
        );
      });

      it('can be overridden', async () => {
        await assert.doesNotReject(
          Test()
            .assert.value('a', 'A')
            .assert.value('b', /b/i)
            .assert.not.value('a', 'b')
            .assert.not.value('b', /a/i)
        );

        await assert.rejects(
          Test().assert.not.value('a', 'A'),
          e('InteractorError', '.input-a value is "A" but expected it not to be')
        );

        await assert.rejects(
          Test().assert.value('b', 'b'),
          e('InteractorError', '.input-b value is "B" but expected "b"')
        );
      });
    });
  });

  describe('property creator', () => {
    const Test = Interactor.extend({
      interactor: {
        timeout: 50
      },

      val: value()
    });

    it('creates a parent bound property', () => {
      assert.equal(Test('.input-a').val, 'A');
      assert.equal(Test('.input-b').val, 'B');
    });

    it('creates an associated parent bound assertion', async () => {
      await assert.doesNotReject(
        Test('.input-a')
          .assert.val('A')
          .assert.not.val('B')
      );

      await assert.rejects(
        Test('.input-b').assert.val('A'),
        e('InteractorError', '.input-b value is "B" but expected "A"')
      );

      await assert.rejects(
        Test('.input-a').assert.not.val('A'),
        e('InteractorError', '.input-a value is "A" but expected it not to be')
      );
    });

    describe('with a selector', () => {
      const Test = Interactor.extend({
        interactor: {
          timeout: 50
        },

        a: value('.input-a'),
        b: value('.input-b')
      });

      it('creates a scoped bound property', () => {
        assert.equal(Test().a, 'A');
        assert.equal(Test().b, 'B');
      });

      it('creates an associated scoped bound assertion', async () => {
        await assert.doesNotReject(
          Test()
            .assert.a('A')
            .assert.b('B')
            .assert.not.a('b')
            .assert.not.b('c')
        );

        await assert.rejects(
          Test().assert.a('b'),
          e('InteractorError', '.input-a value is "A" but expected "b"')
        );

        await assert.rejects(
          Test().assert.not.b('B'),
          e('InteractorError', '.input-b value is "B" but expected it not to be')
        );
      });
    });
  });
});
