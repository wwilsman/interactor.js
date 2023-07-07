import { assert, e, fixture, listen } from './helpers.js';
import I, { InteractorError } from 'interactor.js';

describe('Interactor', () => {
  it('can be used with or without the new keyword', () => {
    assert.instanceOf(new I(), I);
    assert.instanceOf(I(), I);
  });

  it('has a static error constructor', () => {
    assert.typeOf(I.Error, 'function');
    assert.equal(I.Error, InteractorError);
  });

  it('has an inheritable static .extend() method', () => {
    assert.typeOf(I.extend, 'function');
    assert.typeOf(I.extend().extend, 'function');
  });

  it('has an inheritable static .find() method', () => {
    fixture('<p class="test">Test</p>');

    assert.typeOf(I.find, 'function');
    assert.typeOf(I.extend().find, 'function');

    assert.equal(
      I.find('.test').$(),
      document.querySelector('.test')
    );

    assert.equal(I.find('.test', {
      get bar() { return 'baz'; }
    }).bar, 'baz');
  });

  it('can customize the interactor element selector', () => {
    let Test = I.extend();

    fixture(`
      <p class="a">A</li>
      <ul class="list">
        <li class="a">List A</li>
      </ul>
    `);

    Test.selector = sel => `.list ${sel}`;

    assert.equal(
      Test('.a').$(),
      document.querySelector('.list .a')
    );
  });

  it('can create extended instances', () => {
    let test = I('test', {
      get foo() { return 'bar'; }
    });

    assert.instanceOf(test, I);
    assert.equal(test.foo, 'bar');

    let Test = I.extend({
      get foo() { return 'bar'; }
    });

    test = Test('test', { bar: () => 'baz' });

    assert.instanceOf(test, Test);
    assert.equal(test.foo, 'bar');
    assert.equal(test.bar(), 'baz');
  });

  it('can add custom execution middleware', async () => {
    let calls = 0;
    let Test = I.extend();
    Test.executionMiddleware = fn => (calls++, fn());
    fixture('<button class="a">A</button>');

    let test = Test('.a')
      .assert.text('A')
      .exec(() => {})
      .assert.not.text('B')
      .catch(() => {})
      .click();

    assert.equal(calls, 0);
    await test;
    assert.equal(calls, 2);
  });

  describe('$([selector])', () => {
    beforeEach(() => {
      fixture(`
        <div class="a">
          <div class="b"></div>
        </div>
      `);
    });

    it('returns the interactor element', () => {
      assert.equal(
        I('.a').$(),
        document.querySelector('.a')
      );

      assert.equal(
        I($body => $body.querySelector('.a')).$(),
        document.querySelector('.a')
      );
    });

    it('returns the nested interactor element', () => {
      assert.equal(
        I('.a').find('.b').$(),
        document.querySelector('.a .b')
      );

      assert.equal(
        I().find('.a .b').$(),
        document.querySelector('.a .b')
      );
    });

    it('throws when the interactor cannot be found', () => {
      assert.throws(
        () => I('.c').$(),
        e('InteractorError', 'could not find .c')
      );
    });

    describe('with a string selector', () => {
      it('returns the element within the interactor', () => {
        assert.equal(
          I('.a').$('.b'),
          document.querySelector('.a .b')
        );
      });

      it('throws when the selector cannot be found', () => {
        assert.throws(
          () => I('.b').$('.c'),
          e('InteractorError', 'could not find .c within .b')
        );
      });
    });

    describe('with a selector function', () => {
      it('provides the containing element as an argument', () => {
        assert.doesNotThrow(() => {
          I('.a').$($a => {
            assert.equal($a, document.querySelector('.a'));
            return $a;
          });
        });
      });

      it('returns the element from the selector function', () => {
        assert.equal(
          I('.a').$($a => $a.firstElementChild),
          document.querySelector('.a .b')
        );
      });

      it('throws when the selector function does', () => {
        assert.throws(
          () => I('.a').$(() => assert(false)),
          e('AssertionError', 'false == true')
        );
      });

      it('throws when the selector function returns falsey', () => {
        let fn = () => false;
        fn.toString = () => 'fn';

        assert.throws(
          () => I('.a').$(fn),
          e('InteractorError', 'could not find fn within .a')
        );
      });
    });

    describe('with an interactor selector', () => {
      it('returns the selector interactor element', () => {
        assert.equal(
          I('.a').$(I('.b')),
          document.querySelector('.a .b')
        );
      });

      it('throws an error with queued actions', () => {
        assert.throws(
          () => I('.a').$(I('.b').exec()),
          e('InteractorError', 'the provided interactor must not have queued actions')
        );
      });

      it('throws when the interactor cannot be found', () => {
        assert.throws(
          () => I('.b').$(I('.c')),
          e('InteractorError', 'could not find .c within .b')
        );
      });
    });

    describe('with an unknown selector', () => {
      it('throws an unknown selector error', () => {
        assert.throws(
          () => I('.a').$({}),
          e('InteractorError', 'unknown selector: [object Object]')
        );
      });
    });

    describe('with other document roots', () => {
      const Frame = I.extend();

      beforeEach(async () => {
        fixture(`
          <div class="div foo"></div>
          <iframe
            class="test-frame"
            srcdoc="<div class='div bar'></div>"
          ></iframe>
        `);

        let done, dom = new Promise(r => (done = r));
        listen('.test-frame', 'load', function() {
          done(this.contentWindow);
        });

        Frame.dom = await dom;
      });

      it('works with alternate dom references', () => {
        assert.equal(
          I('.div').$(),
          document.querySelector('.div.foo')
        );

        assert.throws(
          () => I('.div.bar').$(),
          e('InteractorError', 'could not find .div.bar')
        );

        assert.equal(
          Frame('.div').$(),
          document.querySelector('.test-frame')
            .contentDocument.body.querySelector('.div.bar')
        );

        assert.throws(
          () => Frame('.div.foo').$(),
          e('InteractorError', 'could not find .div.foo')
        );
      });

      it('automatically searches within nested documents', () => {
        assert.equal(
          I('.test-frame').$('.div.bar'),
          document.querySelector('.test-frame')
            .contentDocument.body.querySelector('.div.bar')
        );
      });

      it('throws an error when a nested document is not accessible', async () => {
        fixture(`
          <iframe
            sandbox
            class="test-frame"
            srcdoc="<div class='div bar'></div>"
          ></iframe>
        `);

        await new Promise(r => listen('.test-frame', 'load', r));

        assert.throws(
          () => I('.test-frame').$('.div.bar'),
          e('InteractorError', '.test-frame is inaccessible, possibly due to CORS')
        );
      });
    });
  });

  describe('$$(selector)', () => {
    beforeEach(() => {
      fixture(`
        <ul class="list">
          <li class="item"></li>
          <li class="item"></li>
          <li class="item"></li>
        </ul>
      `);
    });

    it('returns an array of elements within the interactor', () => {
      assert.deepEqual(
        I('.list').$$('.item'),
        Array.from(document.querySelectorAll('.list .item'))
      );
    });

    it('throws an error when missing a selector', () => {
      assert.throws(
        () => I('.item').$$(),
        e('InteractorError', 'cannot query for multiple elements without a selector')
      );
    });

    describe('with a selector function', () => {
      it('provides a second truthy argument for multiple elements', () => {
        assert.doesNotThrow(() => {
          I('.list').$$(($list, multiple) => {
            assert.equal($list, document.querySelector('.list'));
            assert.equal(multiple, true);
            return $list.children;
          });
        });
      });
    });
  });

  describe('timeout([ms])', () => {
    const interactor = I();

    it('returns the interactor timeout', () => {
      assert.equal(interactor.timeout(), 2000);
    });

    describe('with a custom timeout', () => {
      it('sets a new interactor timeout', () => {
        let next = interactor.timeout(1000);
        assert.notEqual(next, interactor);
        assert.instanceOf(next, I);
        assert.equal(next.timeout(), 1000);
      });
    });
  });

  describe('find(selector[, properties])', () => {
    const Foo = I.extend();
    const Bar = I.extend();

    beforeEach(() => {
      fixture(`
        <div class="a">
          <div class="b"></div>
        </div>
      `);
    });

    it('returns a new child interactor', () => {
      let next = Foo('.a').find('.b');
      assert.notInstanceOf(next, Foo);
      assert.instanceOf(next, I);
      assert.instanceOf(next.exec(), Foo);
    });

    it('can provide child interactor properties', () => {
      let next = Foo('.a').find('.b', {
        get bar() { return 'baz'; }
      });

      assert.notInstanceOf(next, Foo);
      assert.instanceOf(next, I);
      assert.instanceOf(next.exec(), Foo);
      assert.equal(next.bar, 'baz');
    });

    describe('with an interactor selector', () => {
      it('returns a new child instance', () => {
        let next = Foo('.a').find(Bar('.b'));
        assert.instanceOf(next, Bar);
        assert.instanceOf(next.exec(), Foo);
      });

      it('throws when the interactor has queued actions', () => {
        assert.throws(
          () => Foo('.a').find(Bar('.b').exec()),
          e('InteractorError', 'the provided interactor must not have queued actions')
        );
      });
    });
  });

  describe('assert(assertion)', () => {
    it('adds the assertion to the next queue', async () => {
      let called = false;
      await I().assert(() => (called = true));
      assert.equal(called, true);
    });
  });

  describe('exec([callback])', () => {
    it('adds the callback to the next queue', async () => {
      let called = false;
      await I().exec(() => (called = true));
      assert.equal(called, true);
    });

    describe('without a callback', () => {
      it('separates and executes sequential assertions', async () => {
        let count = 0;

        await assert.doesNotReject(
          I().timeout(200)
            .assert(() => (count += 1))
            .assert(() => assert.equal(count, 5))
            .exec()
            .assert(() => (count *= 2))
            .assert(() => assert.equal(count, 40))
        );
      });
    });

    describe('with an interactor action', () => {
      const Foo = I.extend();
      const Bar = I.extend();

      it('returns an new instance of the topmost interactor', () => {
        let next = Foo().exec(Bar().exec());
        assert.instanceOf(next, Foo);
        assert.instanceOf(next.exec(), Foo);
      });

      it('appends actions to the next queue', async () => {
        let called = false;
        await Foo().exec(Bar().exec(() => (called = true)));
        assert.equal(called, true);
      });
    });
  });

  describe('catch(handler)', () => {
    it('adds an error handler to the next queue', async () => {
      let caught = false;
      let called = false;

      await I()
        .exec(() => { throw new Error('test'); })
        .catch(err => (caught = err))
        .exec(() => (called = true));

      assert.instanceOf(caught, Error);
      assert.equal(caught.message, 'test');
      assert.equal(called, true);
    });

    describe('with a string', () => {
      it('formats thrown interactor errors', async () => {
        let called = false;

        await assert.rejects(
          I()
            .exec(() => { throw I.Error('test'); })
            .catch('there was an error: %{e}')
            .exec(() => (called = true)),
          e('InteractorError', 'there was an error: test')
        );

        assert.equal(called, false);
      });

      it('does not format other thrown errors', async () => {
        let called = false;

        await assert.rejects(
          I()
            .exec(() => { throw new Error('test'); })
            .catch('there was an error: %{e}')
            .exec(() => (called = true)),
          e('Error', 'test')
        );

        assert.equal(called, false);
      });
    });
  });

  describe('then()', () => {
    it('enables async/await behavior', async () => {
      let called = false;
      let interactor = I().exec(() => (called = true));

      assert.equal(called, false);
      await interactor;
      assert.equal(called, true);
    });

    it('starts executing the instance queue', async () => {
      let calls = 0;
      let interactor = I()
        .exec(() => calls++)
        .assert(() => assert.equal(calls, 1))
        .exec(() => calls++);

      assert.equal(calls, 0);
      await assert.doesNotReject(interactor);
      assert.equal(calls, 2);
    });

    it('binds each action to the associated instance', async () => {
      let interactor = I();

      interactor.test = 1;
      interactor = interactor.exec(function() {
        assert.equal(this.test, 1);
      });

      await assert.doesNotReject(interactor);
      assert.equal(interactor.test, undefined);
    });

    it('provides each action with the interactor element when needed', async () => {
      fixture('<div class="a"></div>');

      await assert.doesNotReject(
        I('.a')
          .exec($el => ($el.innerText = 'A'))
          .assert($el => assert.equal($el.innerText, 'A'))
      );

      let called = false;

      await assert.rejects(
        I('.b').timeout(100)
          .exec(() => (called = true))
          .assert($el => assert.equal($el.className, 'b')),
        e('InteractorError', 'could not find .b')
      );

      assert.equal(called, true);
    });

    it('repeatedly runs sequential assertions until passing', async () => {
      let count = 0;

      await assert.doesNotReject(
        I().timeout(100)
          .assert(() => (count += 1))
          .assert(() => assert.equal(count, 5))
      );
    });

    it('persists previous assertions with remains', async () => {
      let time = Date.now();
      let delta = 0;

      await assert.doesNotReject(
        I()
          .assert(() => (delta += Date.now() - time))
          .assert(() => (time = Date.now()))
          .assert.remains(100)
      );

      assert(delta >= 100 && delta <= 120, (
        new assert.AssertionError({
          message: `100 < ${delta} < 120`
        })
      ));
    });

    it('runs the previous assertions before executing callbacks', async () => {
      let count = 0;

      await assert.doesNotReject(
        I().timeout(100)
          .assert(() => (count += 1))
          .assert(() => assert.equal(count, 5))
          .exec(() => (count *= 2))
      );

      assert.equal(count, 10);
    });

    it('does not continue the queue when an error is encountered', async () => {
      let called = false;

      await assert.rejects(
        I()
          .exec(() => { throw new Error('test'); })
          .exec(() => (called = true)),
        e('Error', 'test')
      );

      await assert.rejects(
        I().timeout(100)
          .assert(() => { throw new Error('test'); })
          .exec(() => (called = true)),
        e('Error', 'test')
      );

      assert.equal(called, false);
    });

    it('formats thrown interactor errors', async () => {
      await assert.rejects(
        I('foo').exec(function() {
          return this.find('test').exec(() => {
            throw I.Error('%{@} bar %{!!} baz %{- qux}', true);
          });
        }),
        e('InteractorError', 'test within foo bar baz')
      );
    });
  });

  describe('toString', () => {
    it('references the interactor\'s selector', () => {
      assert.equal(I('.foo').toString(), '.foo');
    });

    it('references custom interactor names', () => {
      let Custom = I.extend({ name: 'element' }, {});
      assert.equal(Custom('.bar').toString(), '.bar element');

      let CustomInherit = Custom.extend();
      assert.equal(CustomInherit('.bar').toString(), '.bar element');

      let CustomOverride = Custom.extend({ name: 'qux' }, {});
      assert.equal(CustomOverride('.baz').toString(), '.baz qux');
    });

    it('references any parent instance', () => {
      assert.equal(
        I('.bar').find('.foo').toString(),
        '.foo within .bar'
      );
    });

    it('does not reference undefined selectors', () => {
      assert.equal(I('.bar').find().toString(), '.bar');
    });

    it('uniquely handles default selectors', () => {
      let Test = I.extend({
        selector: 'default'
      }, {});

      // with a string, selector method returns a selector function...
      assert.typeOf(Test.selector, 'function');
      assert.typeOf(Test.selector(), 'function');

      // ...which returns the provided selector, or the default
      assert.equal(Test.selector()(), 'default');
      assert.equal(Test.selector('test')(), 'test');

      // ...which is used in #.toString()
      assert.equal(Test().toString(), 'default');
      assert.equal(Test('test').toString(), 'test');

      // when named...
      Test.name = 'Name';

      // ...still returns the provided selector, or the default
      assert.equal(Test.selector()(), 'default');
      assert.equal(Test.selector('test')(), 'test');

      // ...but the default selector is NOT used in #.toString()
      assert.equal(Test().toString(), 'Name');
      assert.equal(Test('foo').toString(), 'foo Name');

      // can provide a custom selector method
      Test.selector = s => `test[${s ?? 'default'}]`;

      // ...selector method handles return value & defaults
      assert.equal(Test.selector()(), 'test[default]');
      assert.equal(Test.selector('foobar')(), 'test[foobar]');

      // ...only the provided selector is used in #.toString()
      assert.equal(Test().toString(), 'Name');
      assert.equal(Test('foobar').toString(), 'foobar Name');
    });
  });
});
