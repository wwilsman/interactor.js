import { assert, e, fixture, listen, jsdom, mockConsole } from 'tests/helpers';
import I from 'interactor.js';

describe('Actions: scroll', () => {
  beforeEach(() => {
    fixture(`
      <div class="overflow x"><div></div></div>
      <div class="overflow y"><div></div></div>
      <div class="overflow x y"><div></div></div>
      <style>
        .overflow { width: 100px; height: 100px; overflow: hidden; }
        .overflow div { width: 100%; height: 100%; }
        .overflow.x div { width: 200%; }
        .overflow.y div { height: 200%; }
      </style>
    `);
  });

  it('creates a new interactor from the standalone action', () => {
    assert.instanceOf(I.scroll('.overflow.x', { x: 0 }), I);
  });

  if (jsdom()) {
    describe('jsdom', () => {
      const mock = mockConsole();
      const Test = I.extend({
        suppressLayoutEngineWarning: true
      }, {});

      it('throws an overflow error for all elements', async () => {
        await assert.rejects(
          I.scroll(Test('.overflow.x'), { x: 10 }).timeout(50),
          e('InteractorError', '.overflow.x has no overflow-x')
        );

        await assert.rejects(
          I.scroll(Test('.overflow.y'), { y: 10 }).timeout(50),
          e('InteractorError', '.overflow.y has no overflow-y')
        );
      });

      it('logs a warning about the layout engine', async () => {
        await assert.rejects(
          Test('.overflow.x.y').scroll({ x: 10 }).timeout(50),
          e('InteractorError', '.overflow.x.y has no overflow-x')
        );

        assert.equal(mock.warn.calls.length, 0);
        Test.suppressLayoutEngineWarning = false;

        await assert.rejects(
          Test('.overflow.x.y').scroll({ y: 10 }).timeout(50),
          e('InteractorError', '.overflow.x.y has no overflow-y')
        );

        assert.equal(mock.warn.calls.length, 1);
        assert.equal(mock.warn.calls[0], [
          'No layout engine detected.',
          'Overflow as a result of CSS cannot be determined.',
          'You can disable this warning by setting',
          '`I.suppressLayoutEngineWarning = true`'
        ].join(' '));
      });
    });

    // do not run any of the following tests since most will fail
    return;
  }

  it('fires a scroll event on the element after scrolling', async () => {
    let xEvent = listen('.overflow.x', 'scroll');
    let yEvent = listen('.overflow.y', 'scroll');
    let xyEvent = listen('.overflow.x.y', 'scroll');

    assert.equal(xEvent.$el.scrollLeft, 0);
    assert.equal(yEvent.$el.scrollTop, 0);
    assert.equal(xyEvent.$el.scrollLeft, 0);
    assert.equal(xyEvent.$el.scrollTop, 0);

    await I.scroll('.overflow.x', { x: 20 });
    await I.scroll('.overflow.y', { y: 30 });
    await I.scroll('.overflow.x.y', { x: 40, y: 50 });

    assert.equal(xEvent.count, 1);
    assert.equal(yEvent.count, 1);
    assert.equal(xyEvent.count, 1);

    assert.equal(xEvent.$el.scrollLeft, 20);
    assert.equal(yEvent.$el.scrollTop, 30);
    assert.equal(xyEvent.$el.scrollLeft, 40);
    assert.equal(xyEvent.$el.scrollTop, 50);
  });

  it('fires a wheel event when specified', async () => {
    let wEvent = listen('.overflow.x.y', 'wheel');
    let sEvent = listen('.overflow.x.y', 'scroll');

    await I.scroll('.overflow.x.y', { top: 20, wheel: true });

    assert.equal(wEvent.count, 1);
    assert.equal(sEvent.count, 1);
  });

  it('fires events for every iteration of the provided frequency', async () => {
    let pos = [];

    let event = listen('.overflow.y', 'scroll', () => {
      pos.push(event.$el.scrollTop);
    });

    await I.scroll('.overflow.y', { top: 100, frequency: 10 });

    assert.deepEqual(pos, [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
    assert.equal(event.count, 10);
  });

  it('does not scroll the element when the wheel event is cancelled', async () => {
    let wEvent = listen('.overflow.x.y', 'wheel', e => e.preventDefault());
    let sEvent = listen('.overflow.x.y', 'scroll');

    await I.scroll('.overflow.x.y', { top: 10, wheel: true });

    assert.equal(wEvent.$el.scrollTop, 0);
    assert.equal(wEvent.count, 1);
    assert.equal(sEvent.count, 0);
  });

  it('throws an error when scrolling in a direction without overflow', async () => {
    let xEvent = listen('.overflow.x', 'scroll');
    let yEvent = listen('.overflow.y', 'scroll');

    await assert.rejects(
      I.scroll('.overflow.x', { y: 10 }).timeout(50),
      e('InteractorError', '.overflow.x has no overflow-y')
    );

    await assert.rejects(
      I.scroll('.overflow.y', { x: 10 }).timeout(50),
      e('InteractorError', '.overflow.y has no overflow-x')
    );

    assert.equal(xEvent.$el.scrollTop, 0);
    assert.equal(yEvent.$el.scrollLeft, 0);
    assert.equal(xEvent.count, 0);
  });

  it('immediately throws an error when a direction is not provided', () => {
    assert.throws(
      () => I.scroll('.overflow.x'),
      e('InteractorError', 'missing scroll direction')
    );
  });

  it('can be called with an interactor selector', async () => {
    let Test = I.extend({
      foo: y => I.scroll('', { y })
    });

    let action = I.scroll(Test('.overflow.x.y'), { x: 10 });
    let event = listen('.overflow.x.y', 'scroll');

    assert.instanceOf(action, Test);
    assert.equal(event.count, 0);

    await action.foo(20);

    assert.equal(event.count, 2);
    assert.equal(event.$el.scrollTop, 20);
    assert.equal(event.$el.scrollLeft, 10);
  });

  describe('method', () => {
    it('can be called on any interactor', async () => {
      let event = listen('.overflow.y', 'scroll');
      let Test = I.extend({ selector: '.overflow.y' }, {});

      assert.typeOf(I('.overflow.y').scroll, 'function');
      assert.instanceOf(I('.overflow.y').scroll({ top: 10 }), I);

      assert.typeOf(Test().scroll, 'function');
      assert.instanceOf(Test().scroll({ top: 10 }), Test);

      await I('.overflow.y').scroll({ top: 10 });
      await Test().scroll({ top: 10 });

      assert.equal(event.count, 2);
      assert.equal(event.$el.scrollTop, 10);
    });

    it('can be overridden', async () => {
      let event = listen('.overflow.y', 'scroll');
      let called = false;

      let Test = I.extend({ selector: '.btn-a' }, {
        scroll: () => (called = true)
      });

      assert.typeOf(Test().scroll, 'function');
      await Test().scroll();

      assert.equal(event.count, 0);
      assert.equal(called, true);
    });
  });
});
