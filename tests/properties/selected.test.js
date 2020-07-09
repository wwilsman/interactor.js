import { assert, e, fixture } from 'tests/helpers';
import Interactor from 'interactor.js';

describe('Properties: selected', () => {
  const Test = Interactor.extend({
    interactor: {
      timeout: 50
    }
  });

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
      const Test = Interactor.extend({
        interactor: {
          timeout: 50
        },

        assert: {
          selected(expected, n) {
            this.options(n).assert.selected();
          }
        },

        options: n => Interactor(`.opt-${n}`)
      });

      it('works as expected when called via nested methods', async () => {
        await assert.doesNotReject(
          Test('.sel-a')
            .options(1).assert.selected()
            .options(2).assert.not.selected()
        );

        await assert.doesNotReject(
          Test('.sel-b')
            .options(1).assert.not.selected()
            .options(2).assert.selected()
            .options(3).assert.selected()
        );

        await assert.rejects(
          Test('.sel-a').options(1).assert.not.selected(),
          e('InteractorError', '.opt-1 within .sel-a is selected')
        );

        await assert.rejects(
          Test('.sel-b').options(1).assert.selected(),
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
});
