import { assert, e, fixture, jsdom, mockConsole } from 'tests/helpers';
import I from 'interactor.js';

describe('Properties: text', () => {
  const Test = I.extend({
    timeout: 50,
    suppressLayoutEngineWarning: true
  }, {});

  beforeEach(() => {
    fixture(`
      <ul class="list">
        <li class="a">a</li>
        <li class="b">b</li>
      </ul>
      <p class="para">
        <span style="text-transform:uppercase">uppercase</span>
        <span style="text-transform:lowercase">LOWERCASE</span>
      </p>
    `);
  });

  it('returns the element\'s inner text', () => {
    assert.equal(Test('.list .a').text, 'a');
    assert.equal(Test('.list .b').text, 'b');
  });

  it('throws an error when the element does not exist', () => {
    assert.throws(
      () => Test('.list .c').text,
      e('InteractorError', 'could not find .list .c')
    );
  });

  if (!jsdom()) {
    it('returns text content as styled by CSS', () => {
      assert.equal(Test('.para').text, 'UPPERCASE lowercase');
    });
  } else {
    describe('jsdom', () => {
      const mock = mockConsole();

      it('returns the element\'s unstyled text content', () => {
        assert.equal(Test('.para').text, '\n  uppercase\n  LOWERCASE\n');
      });

      it('logs a warning about the layout engine', () => {
        let T = Test.extend();

        assert.equal(T('.list .a').text, 'a');
        assert.equal(mock.warn.calls.length, 0);

        T.suppressLayoutEngineWarning = false;

        assert.equal(T('.list .a').text, 'a');
        assert.equal(mock.warn.calls.length, 1);
        assert.equal(mock.warn.calls[0], [
          'No layout engine detected.',
          'Text content as a result of CSS cannot be determined.',
          'You can disable this warning by setting',
          '`I.suppressLayoutEngineWarning = true`'
        ].join(' '));
      });
    });
  }

  describe('assert', () => {
    it('passes when the text matches', async () => {
      await assert.doesNotReject(
        Test('.list .a').assert.text('a')
      );

      await assert.doesNotReject(
        Test('.list .b').assert.text(/B/i)
      );
    });

    it('fails when the text does not match', async () => {
      await assert.rejects(
        Test('.list .a').assert.text('b'),
        e('InteractorError', '.list .a text is "a" but expected "b"')
      );

      await assert.rejects(
        Test('.list .b').assert.text(/A/i),
        e('InteractorError', '.list .b text is "b" but expected "/A/i"')
      );
    });

    describe('negated', () => {
      it('fails when the text matches', async () => {
        await assert.rejects(
          Test('.list .a').assert.not.text('a'),
          e('InteractorError', '.list .a text is "a" but expected it not to be')
        );

        await assert.rejects(
          Test('.list .b').assert.not.text(/B/i),
          e('InteractorError', '.list .b text is "b" but expected it not to be')
        );
      });

      it('passes when the text does not match', async () => {
        await assert.doesNotReject(
          Test('.list .a').assert.not.text('b')
        );

        await assert.doesNotReject(
          Test('.list .b').assert.not.text(/A/i)
        );
      });
    });

    describe('nested', () => {
      const T = Test.extend({
        assert: {
          text(expected, ab, text) {
            this[ab].assert.text(text);
          }
        },

        a: Test.find('.a'),
        b: Test.find('.b')
      });

      it('works as expected when called via nested methods', async () => {
        await assert.doesNotReject(
          T('.list')
            .assert.a.text('a')
            .assert.b.text(/B/i)
            .assert.a.not.text('A')
            .assert.b.not.text('a')
        );

        await assert.rejects(
          T('.list').assert.a.not.text('a'),
          e('InteractorError', '.a within .list text is "a" but expected it not to be')
        );

        await assert.rejects(
          T('.list').assert.b.text(/A/i),
          e('InteractorError', '.b within .list text is "b" but expected "/A/i"')
        );
      });

      it('can be overridden', async () => {
        await assert.doesNotReject(
          T('.list')
            .assert.text('a', 'a')
            .assert.text('b', /B/i)
            .assert.not.text('a', 'b')
            .assert.not.text('b', /A/i)
        );

        await assert.rejects(
          T('.list').assert.not.text('a', 'a'),
          e('InteractorError', '.a within .list text is "a" but expected it not to be')
        );

        await assert.rejects(
          T('.list').assert.text('b', 'B'),
          e('InteractorError', '.b within .list text is "b" but expected "B"')
        );
      });
    });
  });

  describe('property creator', () => {
    const T = Test.extend({
      content: I.text()
    });

    it('creates a parent bound property', () => {
      assert.equal(T('.list .a').content, 'a');
      assert.equal(T('.list .b').content, 'b');
    });

    it('creates an associated parent bound assertion', async () => {
      await assert.doesNotReject(
        T('.list .a')
          .assert.content('a')
          .assert.not.content('b')
      );

      await assert.rejects(
        T('.list .b').assert.content('a'),
        e('InteractorError', '.list .b text is "b" but expected "a"')
      );

      await assert.rejects(
        T('.list .a').assert.not.content('a'),
        e('InteractorError', '.list .a text is "a" but expected it not to be')
      );
    });

    describe('with a selector', () => {
      const T = Test.extend({
        a: I.text('.a'),
        b: I.text('.b')
      });

      it('creates a scoped bound property', () => {
        assert.equal(T('.list').a, 'a');
        assert.equal(T('.list').b, 'b');
      });

      it('creates an associated scoped bound assertion', async () => {
        await assert.doesNotReject(
          T('.list')
            .assert.a('a')
            .assert.b('b')
            .assert.not.a('b')
            .assert.not.b('c')
        );

        await assert.rejects(
          T('.list').assert.a('b'),
          e('InteractorError', '.a within .list text is "a" but expected "b"')
        );

        await assert.rejects(
          T('.list').assert.not.b('b'),
          e('InteractorError', '.b within .list text is "b" but expected it not to be')
        );
      });

      // rather than globally disable the layout engine warning, just skip this test for jsdom
      if (!jsdom()) {
        it('can be awaited on for the value', async () => {
          assert.equal(await I.text('.list .a'), 'a');
          assert.equal(await I.text('.list .b'), 'b');
        });
      }
    });
  });
});
