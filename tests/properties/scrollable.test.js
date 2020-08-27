import { assert, e, fixture, jsdom, mockConsole } from 'tests/helpers';
import Interactor, { scrollable, scrollableX, scrollableY } from 'interactor.js';

describe('Properties: scrollable', () => {
  const Test = Interactor.extend({
    timeout: 50,
    suppressLayoutEngineWarning: true
  }, {});

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

  if (jsdom()) {
    describe('jsdom', () => {
      const mock = mockConsole();

      it('returns false when overflow cannot be determined', () => {
        assert.equal(Test('.overflow.x').scrollable, false);
        assert.equal(Test('.overflow.x').scrollableX, false);
        assert.equal(Test('.overflow.x').scrollableY, false);
        assert.equal(Test('.overflow.y').scrollable, false);
        assert.equal(Test('.overflow.y').scrollableX, false);
        assert.equal(Test('.overflow.y').scrollableY, false);
        assert.equal(Test('.overflow.x.y').scrollable, false);
        assert.equal(Test('.overflow.x.y').scrollableX, false);
        assert.equal(Test('.overflow.x.y').scrollableY, false);
        assert.equal(Test('.overflow.none').scrollable, false);
        assert.equal(Test('.overflow.none').scrollableX, false);
        assert.equal(Test('.overflow.none').scrollableY, false);
      });

      it('logs a warning about the layout engine', () => {
        let T = Test.extend();

        assert.equal(T('.overflow.x').scrollableX, false);
        assert.equal(T('.overflow.y').scrollableY, false);
        assert.equal(T('.overflow.x.y').scrollable, false);
        assert.equal(mock.warn.calls.length, 0);

        T.suppressLayoutEngineWarning = false;

        assert.equal(T('.overflow.x').scrollableX, false);
        assert.equal(T('.overflow.y').scrollableY, false);
        assert.equal(T('.overflow.x.y').scrollable, false);
        assert.equal(mock.warn.calls.length, 1);
        assert.equal(mock.warn.calls[0], [
          'No layout engine detected.',
          'Overflow as a result of CSS cannot be determined.',
          'You can disable this warning by setting',
          '`Interactor.suppressLayoutEngineWarning = true`'
        ].join(' '));
      });
    });

    // do not run any of the following tests since most will fail
    return;
  }

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
      const Test = Interactor.extend({ timeout: 50 }, {
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

  describe('property creator', () => {
    const Test = Interactor.extend({ timeout: 50 }, {
      x: scrollableX(),
      y: scrollableY(),
      any: scrollable()
    });

    it('creates a parent bound property', () => {
      assert.equal(Test('.overflow.x').x, true);
      assert.equal(Test('.overflow.x').y, false);
      assert.equal(Test('.overflow.x').any, true);
      assert.equal(Test('.overflow.y').x, false);
      assert.equal(Test('.overflow.y').y, true);
      assert.equal(Test('.overflow.y').any, true);
      assert.equal(Test('.overflow.x.y').x, true);
      assert.equal(Test('.overflow.x.y').y, true);
      assert.equal(Test('.overflow.x.y').any, true);
      assert.equal(Test('.overflow.none').x, false);
      assert.equal(Test('.overflow.none').y, false);
      assert.equal(Test('.overflow.none').any, false);
    });

    it('creates an associated parent bound assertion', async () => {
      await assert.doesNotReject(
        Test('.overflow.x').assert.x()
      );

      await assert.doesNotReject(
        Test('.overflow.y').assert.not.x()
      );

      await assert.rejects(
        Test('.overflow.x.y').assert.not.any(),
        e('InteractorError', '.overflow.x.y has overflow')
      );

      await assert.rejects(
        Test('.overflow.none').assert.any(),
        e('InteractorError', '.overflow.none has no overflow')
      );
    });

    describe('with a selector', () => {
      const Test = Interactor.extend({ timeout: 50 }, {
        X: scrollableX('.overflow.x'),
        Xy: scrollableY('.overflow.x'),
        Y: scrollableY('.overflow.y'),
        Yx: scrollableX('.overflow.y'),
        any: scrollable('.overflow.x.y'),
        none: scrollable('.overflow.none')
      });

      it('creates a scoped bound property', () => {
        assert.equal(Test().X, true);
        assert.equal(Test().Xy, false);
        assert.equal(Test().Y, true);
        assert.equal(Test().Yx, false);
        assert.equal(Test().any, true);
        assert.equal(Test().none, false);
      });

      it('creates an associated scoped bound assertion', async () => {
        await assert.doesNotReject(
          Test()
            .assert.X()
            .assert.Y()
            .assert.any()
            .assert.not.Xy()
            .assert.not.Yx()
            .assert.not.none()
        );

        await assert.rejects(
          Test().assert.not.X(),
          e('InteractorError', '.overflow.x has overflow-x')
        );

        await assert.rejects(
          Test().assert.none(),
          e('InteractorError', '.overflow.none has no overflow')
        );
      });

      it('can be awaited on for the value', async () => {
        assert.equal(await scrollable('.overflow.x'), true);
        assert.equal(await scrollableX('.overflow.x'), true);
        assert.equal(await scrollableY('.overflow.x'), false);
        assert.equal(await scrollable('.overflow.y'), true);
        assert.equal(await scrollableX('.overflow.y'), false);
        assert.equal(await scrollableY('.overflow.y'), true);
        assert.equal(await scrollable('.overflow.x.y'), true);
        assert.equal(await scrollableX('.overflow.x.y'), true);
        assert.equal(await scrollableY('.overflow.x.y'), true);
        assert.equal(await scrollable('.overflow.none'), false);
        assert.equal(await scrollableX('.overflow.none'), false);
        assert.equal(await scrollableY('.overflow.none'), false);
      });
    });
  });
});
