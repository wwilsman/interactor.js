import { assert, e, fixture, jsdom, mockConsole } from '../helpers.js';
import I from 'interactor.js';

describe('Properties: visible', () => {
  const Test = I.extend({ timeout: 50 }, {});

  beforeEach(() => {
    fixture(`
      <style>div { width: 20px; height: 20px; }</style>
      <div class="hidden" style="display:none"></div>
      <div class="invisible" style="visibility:hidden"></div>
      <div class="opacity-0" style="opacity:0"></div>
      <div class="width-0" style="width:0px;"></div>
      <div class="height-0" style="height:0px"></div>
      <div class="above-screen" style="position:absolute;top:-999px;"></div>
      <div class="below-screen" style="position:absolute;bottom:-999px;"></div>
      <div class="left-of-screen" style="position:absolute;left:-999px;"></div>
      <div class="right-of-screen" style="position:absolute;right:-999px;"></div>
      <div class="visible" style="position:relative">
        <style>.visible > * { position: absolute; }</style>
        <div class="covered-full"></div>
        <div class="peek-top" style="top:-5px"></div>
        <div class="peek-bottom" style="bottom:-5px"></div>
        <div class="peek-left" style="left:-5px"></div>
        <div class="peek-right" style="right:-5px"></div>
        <div class="cover"></div>
      </div>
    `);
  });

  if (jsdom()) {
    const mock = mockConsole();

    it('logs a warning about the layout engine', () => {
      // jsdom will always return false unless getBoundingClientRect is mocked
      assert.equal(Test('#test').visible, false);

      assert.equal(mock.warn.calls.length, 1);
      assert.equal(mock.warn.calls[0], [
        'No layout engine detected.',
        'Visibility as a result of CSS cannot be determined.',
        'You can disable this warning by setting',
        '`I.suppressLayoutEngineWarning = true`'
      ].join(' '));
    });

    return;
  }

  it('returns a boolean value reflecting the element\'s visibility', () => {
    assert.equal(Test('.hidden').visible, false);
    assert.equal(Test('.invisible').visible, false);
    assert.equal(Test('.opacity-0').visible, false);
    assert.equal(Test('.width-0').visible, false);
    assert.equal(Test('.height-0').visible, false);
    assert.equal(Test('.above-screen').visible, false);
    assert.equal(Test('.below-screen').visible, false);
    assert.equal(Test('.left-of-screen').visible, false);
    assert.equal(Test('.right-of-screen').visible, false);
    assert.equal(Test('.covered-full').visible, false);
    assert.equal(Test('.peek-top').visible, true);
    assert.equal(Test('.peek-bottom').visible, true);
    assert.equal(Test('.peek-left').visible, true);
    assert.equal(Test('.peek-right').visible, true);
    assert.equal(Test('.visible').visible, true);
  });

  describe('assert', () => {
    it('passes when the element is visible', async () => {
      await assert.doesNotReject(
        Test('.visible').assert.visible()
      );
    });

    it('fails when the element is not visible', async () => {
      await assert.rejects(
        Test('.invisible').assert.visible(),
        e('InteractorError', '.invisible is not visible')
      );
    });

    describe('negated', () => {
      it('fails when the element is visible', async () => {
        await assert.rejects(
          Test('.visible').assert.not.visible(),
          e('InteractorError', '.visible is visible')
        );
      });

      it('passes when the element is not visible', async () => {
        await assert.doesNotReject(
          Test('.invisible').assert.not.visible()
        );
      });
    });

    describe('nested', () => {
      const Test = I.extend({ timeout: 50 }, {
        assert: {
          visible(expected, foobar) {
            this[foobar].assert.visible();
          }
        },

        foo: I('.visible'),
        bar: I('.invisible')
      });

      it('works as expected when called via nested methods', async () => {
        await assert.doesNotReject(
          Test()
            .assert.foo.visible()
            .assert.bar.not.visible()
        );

        await assert.rejects(
          Test().assert.foo.not.visible(),
          e('InteractorError', '.visible is visible')
        );

        await assert.rejects(
          Test().assert.bar.visible(),
          e('InteractorError', '.invisible is not visible')
        );
      });

      it('can be overridden', async () => {
        await assert.doesNotReject(
          Test()
            .assert.visible('foo')
            .assert.not.visible('bar')
        );

        await assert.rejects(
          Test().assert.not.visible('foo'),
          e('InteractorError', '.visible is visible')
        );

        await assert.rejects(
          Test().assert.visible('bar'),
          e('InteractorError', '.invisible is not visible')
        );
      });
    });
  });

  describe('property creator', () => {
    const Test = I.extend({ timeout: 50 }, {
      there: I.visible()
    });

    it('creates a parent bound property', () => {
      assert.equal(Test('.visible').there, true);
      assert.equal(Test('.invisible').there, false);
    });

    it('creates an associated parent bound assertion', async () => {
      await assert.doesNotReject(
        Test('.visible').assert.there()
      );

      await assert.doesNotReject(
        Test('.invisible').assert.not.there()
      );

      await assert.rejects(
        Test('.visible').assert.not.there(),
        e('InteractorError', '.visible is visible')
      );

      await assert.rejects(
        Test('.invisible').assert.there(),
        e('InteractorError', '.invisible is not visible')
      );
    });

    describe('with a selector', () => {
      const Test = I.extend({ timeout: 50 }, {
        foo: I.visible('.visible'),
        bar: I.visible('.invisible')
      });

      it('creates a scoped bound property', () => {
        assert.equal(Test().foo, true);
        assert.equal(Test().bar, false);
      });

      it('creates an associated scoped bound assertion', async () => {
        await assert.doesNotReject(
          Test()
            .assert.foo()
            .assert.not.bar()
        );

        await assert.rejects(
          Test().assert.not.foo(),
          e('InteractorError', '.visible is visible')
        );

        await assert.rejects(
          Test().assert.bar(),
          e('InteractorError', '.invisible is not visible')
        );
      });

      it('can be awaited on for the value', async () => {
        assert.equal(await I.visible('.visible'), true);
        assert.equal(await I.visible('.invisible'), false);
      });
    });
  });
});
