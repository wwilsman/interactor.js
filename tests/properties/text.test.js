import { assert, e, fixture } from 'tests/helpers';
import Interactor from 'interactor.js';

describe('Properties: text', () => {
  const Test = Interactor.extend({
    interactor: {
      timeout: 50
    }
  });

  beforeEach(() => {
    fixture(`
      <ul class="list" style="text-transform:uppercase">
        <li class="a">a</li>
        <li class="b">b</li>
      </ul>
    `);
  });

  it('returns the element\'s text content', () => {
    assert.equal(Test('.list .a').text, 'A');
    assert.equal(Test('.list .b').text, 'B');
  });

  it('throws an error when the element does not exist', () => {
    assert.throws(
      () => Test('.list .c').text,
      e('InteractorError', 'could not find .list .c')
    );
  });

  describe('assert', () => {
    it('passes when the text matches', async () => {
      await assert.doesNotReject(
        Test('.list .a').assert.text('A')
      );

      await assert.doesNotReject(
        Test('.list .b').assert.text(/b/i)
      );
    });

    it('fails when the text does not match', async () => {
      await assert.rejects(
        Test('.list .a').assert.text('B'),
        e('InteractorError', '.list .a text is "A" but expected "B"')
      );

      await assert.rejects(
        Test('.list .b').assert.text(/a/i),
        e('InteractorError', '.list .b text is "B" but expected "/a/i"')
      );
    });

    describe('negated', () => {
      it('fails when the text matches', async () => {
        await assert.rejects(
          Test('.list .a').assert.not.text('A'),
          e('InteractorError', '.list .a text is "A" but expected it not to be')
        );

        await assert.rejects(
          Test('.list .b').assert.not.text(/b/i),
          e('InteractorError', '.list .b text is "B" but expected it not to be')
        );
      });

      it('passes when the text does not match', async () => {
        await assert.doesNotReject(
          Test('.list .a').assert.not.text('B')
        );

        await assert.doesNotReject(
          Test('.list .b').assert.not.text(/a/i)
        );
      });
    });

    describe('nested', () => {
      const Test = Interactor.extend({
        interactor: {
          timeout: 50
        },

        assert: {
          text(expected, ab, text) {
            this[ab].assert.text(text);
          }
        },

        a: Interactor('.a'),
        b: Interactor('.b')
      });

      it('works as expected when called via nested methods', async () => {
        await assert.doesNotReject(
          Test('.list')
            .assert.a.text('A')
            .assert.b.text(/b/i)
            .assert.a.not.text('a')
            .assert.b.not.text('A')
        );

        await assert.rejects(
          Test('.list').assert.a.not.text('A'),
          e('InteractorError', '.a within .list text is "A" but expected it not to be')
        );

        await assert.rejects(
          Test('.list').assert.b.text(/a/i),
          e('InteractorError', '.b within .list text is "B" but expected "/a/i"')
        );
      });

      it('can be overridden', async () => {
        await assert.doesNotReject(
          Test('.list')
            .assert.text('a', 'A')
            .assert.text('b', /b/i)
            .assert.not.text('a', 'b')
            .assert.not.text('b', /a/i)
        );

        await assert.rejects(
          Test('.list').assert.not.text('a', 'A'),
          e('InteractorError', '.a within .list text is "A" but expected it not to be')
        );

        await assert.rejects(
          Test('.list').assert.text('b', 'b'),
          e('InteractorError', '.b within .list text is "B" but expected "b"')
        );
      });
    });
  });
});
