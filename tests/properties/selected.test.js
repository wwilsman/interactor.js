import { assert, e, fixture } from '../helpers.js';
import I from 'interactor.js';

describe('Properties: selected', () => {
  const Test = I.extend({ timeout: 50 }, {});

  beforeEach(() => {
    fixture(`
      <select class="sel-a">
        <option class="opt-1"></option>
        <option class="opt-2"></option>
      </select>
      <select multiple class="sel-b">
        <option class="opt-1"></option>
        <option class="opt-2" selected></option>
        <option class="opt-3" selected></option>
      </select>
    `);
  });

  it('returns a boolean value reflecting the element\'s selected state', () => {
    assert.equal(Test('.sel-a .opt-1').selected, true);
    assert.equal(Test('.sel-a .opt-2').selected, false);
    assert.equal(Test('.sel-b .opt-1').selected, false);
    assert.equal(Test('.sel-b .opt-2').selected, true);
    assert.equal(Test('.sel-b .opt-3').selected, true);
  });

  it('throws an error when the element does not exist', () => {
    assert.throws(
      () => Test('.sel-a .opt-3').selected,
      e('InteractorError', 'could not find .sel-a .opt-3')
    );
  });

  describe('assert', () => {
    it('passes when the element is selected', async () => {
      await assert.doesNotReject(
        Test('.sel-a .opt-1').assert.selected()
      );
    });

    it('fails when the element is not selected', async () => {
      await assert.rejects(
        Test('.sel-a .opt-2').assert.selected(),
        e('InteractorError', '.sel-a .opt-2 is not selected')
      );
    });

    describe('negated', () => {
      it('fails when the element is selected', async () => {
        await assert.rejects(
          Test('.sel-b .opt-2').assert.not.selected(),
          e('InteractorError', '.sel-b .opt-2 is selected')
        );
      });

      it('passes when the element is not selected', async () => {
        await assert.doesNotReject(
          Test('.sel-b .opt-1').assert.not.selected()
        );
      });
    });

    describe('nested', () => {
      const Test = I.extend({ timeout: 50 }, {
        assert: {
          selected(expected, n) {
            this.assert.options(n).selected();
          }
        },

        options: {
          child: n => I.find(`.opt-${n}`)
        }
      });

      it('works as expected when called via nested methods', async () => {
        await assert.doesNotReject(
          Test('.sel-a')
            .assert.options(1).selected()
            .assert.options(2).not.selected()
        );

        await assert.doesNotReject(
          Test('.sel-b')
            .assert.options(1).not.selected()
            .assert.options(2).selected()
            .assert.options(3).selected()
        );

        await assert.rejects(
          Test('.sel-a').assert.options(1).not.selected(),
          e('InteractorError', '.opt-1 within .sel-a is selected')
        );

        await assert.rejects(
          Test('.sel-b').assert.options(1).selected(),
          e('InteractorError', '.opt-1 within .sel-b is not selected')
        );
      });

      it('can be overridden', async () => {
        await assert.doesNotReject(
          Test('.sel-a')
            .assert.selected(1)
            .assert.not.selected(2)
        );

        await assert.doesNotReject(
          Test('.sel-b')
            .assert.not.selected(1)
            .assert.selected(2)
            .assert.selected(3)
        );

        await assert.rejects(
          Test('.sel-a').assert.not.selected(1),
          e('InteractorError', '.opt-1 within .sel-a is selected')
        );

        await assert.rejects(
          Test('.sel-b').assert.selected(1),
          e('InteractorError', '.opt-1 within .sel-b is not selected')
        );
      });
    });
  });

  describe('property creator', () => {
    const Test = I.extend({ timeout: 50 }, {
      chosen: I.selected()
    });

    it('creates a parent bound property', () => {
      assert.equal(Test('.sel-a .opt-1').chosen, true);
      assert.equal(Test('.sel-b .opt-1').chosen, false);
    });

    it('creates an associated parent bound assertion', async () => {
      await assert.doesNotReject(
        Test('.sel-a .opt-1').assert.chosen()
      );

      await assert.doesNotReject(
        Test('.sel-b .opt-1').assert.not.chosen()
      );

      await assert.rejects(
        Test('.sel-a .opt-1').assert.not.chosen(),
        e('InteractorError', '.sel-a .opt-1 is selected')
      );

      await assert.rejects(
        Test('.sel-b .opt-1').assert.chosen(),
        e('InteractorError', '.sel-b .opt-1 is not selected')
      );
    });

    describe('with a selector', () => {
      const Test = I.extend({ timeout: 50 }, {
        one: I.selected('.opt-1'),
        two: I.selected('.opt-2')
      });

      it('creates a scoped bound property', () => {
        assert.equal(Test('.sel-a').one, true);
        assert.equal(Test('.sel-a').two, false);
        assert.equal(Test('.sel-b').one, false);
        assert.equal(Test('.sel-b').two, true);
      });

      it('creates an associated scoped bound assertion', async () => {
        await assert.doesNotReject(
          Test('.sel-a')
            .assert.one()
            .assert.not.two()
        );

        await assert.rejects(
          Test('.sel-b').assert.one(),
          e('InteractorError', '.opt-1 within .sel-b is not selected')
        );

        await assert.rejects(
          Test('.sel-a').assert.not.one(),
          e('InteractorError', '.opt-1 within .sel-a is selected')
        );
      });

      it('can be awaited on for the value', async () => {
        assert.equal(await I.selected('.sel-a .opt-1'), true);
        assert.equal(await I.selected('.sel-b .opt-1'), false);
      });
    });
  });
});
