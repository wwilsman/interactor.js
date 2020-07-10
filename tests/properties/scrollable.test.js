import { assert, e, fixture } from 'tests/helpers';
import Interactor from 'interactor.js';

describe('Properties: scrollable', () => {
  const Test = Interactor.extend({
    interactor: {
      timeout: 50
    }
  });

  beforeEach(() => {
    fixture(`
      <div class="overflow x"><div></div></div>
      <div class="overflow y"><div></div></div>
      <div class="overflow x y"><div></div></div>
      <div class="overflow none"><div></div></div>
      <style>
        .overflow { width: 100px; height: 100px; overflow: hidden; }
        .overflow div { width: 100%; height: 100%; }
        .overflow.x div { width: 200%; }
        .overflow.y div { height: 200%; }
      </style>
    `);
  });

  it('returns a boolean value reflecting the element\'s scrollable state', () => {
    assert.equal(Test('.overflow.x').scrollable, true);
    assert.equal(Test('.overflow.x').scrollableX, true);
    assert.equal(Test('.overflow.x').scrollableY, false);
    assert.equal(Test('.overflow.y').scrollable, true);
    assert.equal(Test('.overflow.y').scrollableX, false);
    assert.equal(Test('.overflow.y').scrollableY, true);
    assert.equal(Test('.overflow.x.y').scrollable, true);
    assert.equal(Test('.overflow.x.y').scrollableX, true);
    assert.equal(Test('.overflow.x.y').scrollableY, true);
    assert.equal(Test('.overflow.none').scrollable, false);
    assert.equal(Test('.overflow.none').scrollableX, false);
    assert.equal(Test('.overflow.none').scrollableY, false);
  });

  it('throws an error when the element does not exist', () => {
    assert.throws(
      () => Test('.overflow.z').scrollable,
      e('InteractorError', 'could not find .overflow.z')
    );

    assert.throws(
      () => Test('.overflow.z').scrollableX,
      e('InteractorError', 'could not find .overflow.z')
    );

    assert.throws(
      () => Test('.overflow.z').scrollableY,
      e('InteractorError', 'could not find .overflow.z')
    );
  });

  describe('assert', () => {
    it('passes when the element is scrollable', async () => {
      await assert.doesNotReject(
        Test('.overflow.x')
          .assert.scrollable()
          .assert.scrollableX()
      );

      await assert.doesNotReject(
        Test('.overflow.y')
          .assert.scrollable()
          .assert.scrollableY()
      );

      await assert.doesNotReject(
        Test('.overflow.x.y')
          .assert.scrollable()
          .assert.scrollableX()
          .assert.scrollableY()
      );
    });

    it('fails when the element is not scrollable', async () => {
      await assert.rejects(
        Test('.overflow.x').assert.scrollableY(),
        e('InteractorError', '.overflow.x has no overflow-y')
      );

      await assert.rejects(
        Test('.overflow.y').assert.scrollableX(),
        e('InteractorError', '.overflow.y has no overflow-x')
      );

      await assert.rejects(
        Test('.overflow.none').assert.scrollable(),
        e('InteractorError', '.overflow.none has no overflow')
      );
    });

    describe('negated', () => {
      it('fails when the element is scrollable', async () => {
        await assert.rejects(
          Test('.overflow.x').assert.not.scrollableX(),
          e('InteractorError', '.overflow.x has overflow-x')
        );

        await assert.rejects(
          Test('.overflow.y').assert.not.scrollableY(),
          e('InteractorError', '.overflow.y has overflow-y')
        );

        await assert.rejects(
          Test('.overflow.x.y').assert.not.scrollable(),
          e('InteractorError', '.overflow.x.y has overflow')
        );
      });

      it('passes when the element is not scrollable', async () => {
        await assert.doesNotReject(
          Test('.overflow.x').assert.not.scrollableY()
        );

        await assert.doesNotReject(
          Test('.overflow.y').assert.not.scrollableX()
        );

        await assert.doesNotReject(
          Test('.overflow.none').assert.not.scrollable()
        );
      });
    });

    describe('nested', () => {
      const Test = Interactor.extend({
        interactor: {
          timeout: 50
        },

        assert: {
          scrollable(expected, xy) {
            this[xy].assert.scrollable();
            if (xy === 'x') this.x.assert.scrollableX();
            if (xy === 'y') this.y.assert.scrollableY();
          }
        },

        x: Interactor('.overflow.x'),
        y: Interactor('.overflow.y'),
        z: Interactor('.overflow.none')
      });

      it('works as expected when called via nested methods', async () => {
        await assert.doesNotReject(
          Test()
            .assert.x.scrollable()
            .assert.x.scrollableX()
            .assert.x.not.scrollableY()
            .assert.y.scrollable()
            .assert.y.not.scrollableX()
            .assert.y.scrollableY()
            .assert.z.not.scrollable()
        );

        await assert.rejects(
          Test().assert.x.not.scrollable(),
          e('InteractorError', '.overflow.x has overflow')
        );

        await assert.rejects(
          Test().assert.x.scrollableY(),
          e('InteractorError', '.overflow.x has no overflow-y')
        );

        await assert.rejects(
          Test().assert.y.not.scrollable(),
          e('InteractorError', '.overflow.y has overflow')
        );

        await assert.rejects(
          Test().assert.y.scrollableX(),
          e('InteractorError', '.overflow.y has no overflow-x')
        );

        await assert.rejects(
          Test().assert.z.scrollable(),
          e('InteractorError', '.overflow.none has no overflow')
        );
      });

      it('can be overridden', async () => {
        await assert.doesNotReject(
          Test()
            .assert.scrollable('x')
            .assert.scrollable('y')
            .assert.not.scrollable('z')
        );

        await assert.rejects(
          Test().assert.not.scrollable('x'),
          e('InteractorError', '.overflow.x has overflow')
        );

        await assert.rejects(
          Test().assert.not.scrollable('y'),
          e('InteractorError', '.overflow.y has overflow')
        );

        await assert.rejects(
          Test().assert.scrollable('z'),
          e('InteractorError', '.overflow.none has no overflow')
        );
      });
    });
  });
});
