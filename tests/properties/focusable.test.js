import { assert, e, fixture } from 'tests/helpers';
import I from 'interactor.js';

describe('Properties: focusable', () => {
  const Test = I.extend({ timeout: 50 }, {});

  beforeEach(() => {
    fixture(`
      <input class="input-a"/>
      <input class="input-b" disabled/>
      <h1 class="heading-a" tabindex="0"></h1>
      <h1 class="heading-b"></h1>
    `);
  });

  it('returns a boolean value reflecting if the element is focusable', () => {
    assert.equal(Test('.input-a').focusable, true);
    assert.equal(Test('.input-b').focusable, false);
    assert.equal(Test('.heading-a').focusable, true);
    assert.equal(Test('.heading-b').focusable, false);
  });

  it('throws an error when the element does not exist', () => {
    assert.throws(
      () => Test('.input-c').focusable,
      e('InteractorError', 'could not find .input-c')
    );
  });

  describe('assert', () => {
    it('passes when the element is focusable', async () => {
      await assert.doesNotReject(
        Test('.input-a').assert.focusable()
      );

      await assert.doesNotReject(
        Test('.heading-a').assert.focusable()
      );
    });

    it('fails when the element is not focusable', async () => {
      await assert.rejects(
        Test('.input-b').assert.focusable(),
        e('InteractorError', '.input-b is disabled')
      );

      await assert.rejects(
        Test('.heading-b').assert.focusable(),
        e('InteractorError', '.heading-b is not focusable')
      );
    });

    describe('negated', () => {
      it('fails when the element is focusable', async () => {
        await assert.rejects(
          Test('.input-a').assert.not.focusable(),
          e('InteractorError', '.input-a is focusable')
        );

        await assert.rejects(
          Test('.heading-a').assert.not.focusable(),
          e('InteractorError', '.heading-a is focusable')
        );
      });

      it('passes when the element is not focusable', async () => {
        await assert.doesNotReject(
          Test('.input-b').assert.not.focusable()
        );

        await assert.doesNotReject(
          Test('.heading-b').assert.not.focusable()
        );
      });
    });

    describe('nested', () => {
      const Test = I.extend({ timeout: 50 }, {
        assert: {
          focusable(expected, input, heading) {
            this.assert.input(input).focusable();
            this.assert.heading(heading).focusable();
          }
        },

        input: {
          child: ab => I(`.input-${ab}`)
        },

        heading: {
          child: ab => I(`.heading-${ab}`)
        }
      });

      it('works as expected when called via nested methods', async () => {
        await assert.doesNotReject(
          Test()
            .assert.input('a').focusable()
            .assert.heading('a').focusable()
            .assert.input('b').not.focusable()
            .assert.heading('b').not.focusable()
        );

        await assert.rejects(
          Test().assert.input('a').not.focusable(),
          e('InteractorError', '.input-a is focusable')
        );

        await assert.rejects(
          Test().assert.heading('a').not.focusable(),
          e('InteractorError', '.heading-a is focusable')
        );

        await assert.rejects(
          Test().assert.input('b').focusable(),
          e('InteractorError', '.input-b is disabled')
        );

        await assert.rejects(
          Test().assert.heading('b').focusable(),
          e('InteractorError', '.heading-b is not focusable')
        );
      });

      it('can be overridden', async () => {
        await assert.doesNotReject(
          Test()
            .assert.focusable('a', 'a')
            .assert.not.focusable('b', 'b')
        );

        await assert.rejects(
          Test().assert.not.focusable('a', 'b'),
          e('InteractorError', '.input-a is focusable')
        );

        await assert.rejects(
          Test().assert.not.focusable('b', 'a'),
          e('InteractorError', '.heading-a is focusable')
        );

        await assert.rejects(
          Test().assert.focusable('b', 'a'),
          e('InteractorError', '.input-b is disabled')
        );

        await assert.rejects(
          Test().assert.focusable('a', 'b'),
          e('InteractorError', '.heading-b is not focusable')
        );
      });
    });
  });

  describe('property creator', () => {
    const Test = I.extend({ timeout: 50 }, {
      blurrable: I.focusable()
    });

    it('creates a parent bound property', () => {
      assert.equal(Test('.input-a').blurrable, true);
      assert.equal(Test('.input-b').blurrable, false);
    });

    it('creates an associated parent bound assertion', async () => {
      await assert.doesNotReject(
        Test('.input-a').assert.blurrable()
      );

      await assert.doesNotReject(
        Test('.input-b').assert.not.blurrable()
      );

      await assert.rejects(
        Test('.input-a').assert.not.blurrable(),
        e('InteractorError', '.input-a is focusable')
      );

      await assert.rejects(
        Test('.input-b').assert.blurrable(),
        e('InteractorError', '.input-b is disabled')
      );
    });

    describe('with a selector', () => {
      const Test = I.extend({ timeout: 50 }, {
        a: I.focusable('.input-a'),
        b: I.focusable('.input-b')
      });

      it('creates a scoped bound property', () => {
        assert.equal(Test().a, true);
        assert.equal(Test().b, false);
      });

      it('creates an associated scoped bound assertion', async () => {
        await assert.doesNotReject(
          Test()
            .assert.a()
            .assert.not.b()
        );

        await assert.rejects(
          Test().assert.not.a(),
          e('InteractorError', '.input-a is focusable')
        );

        await assert.rejects(
          Test().assert.b(),
          e('InteractorError', '.input-b is disabled')
        );
      });

      it('can be awaited on for the value', async () => {
        assert.equal(await I.focusable('.input-a'), true);
        assert.equal(await I.focusable('.input-b'), false);
      });
    });
  });
});
