import { assert, e, fixture, listen } from 'tests/helpers';
import Interactor from 'interactor.js';

describe('Interactor', () => {
  it('can be used with or without the new keyword', () => {
    assert.instanceOf(new Interactor(), Interactor);
    assert.instanceOf(Interactor(), Interactor);
  });

  it('has a static .error() method', () => {
    assert.typeOf(Interactor.error, 'function');
  });

  it('has an inheritable static .extend() method', () => {
    assert.typeOf(Interactor.extend, 'function');
    assert.typeOf(Interactor.extend().extend, 'function');
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
        Interactor('.a').$(),
        document.querySelector('.a')
      );

      assert.equal(
        Interactor($body => $body.querySelector('.a')).$(),
        document.querySelector('.a')
      );
    });

    it('returns the nested interactor element', () => {
      assert.equal(
        Interactor('.a').find('.b').$(),
        document.querySelector('.a .b')
      );

      assert.equal(
        Interactor().find('.a .b').$(),
        document.querySelector('.a .b')
      );
    });

    it('throws when the interactor cannot be found', () => {
      assert.throws(
        () => Interactor('.c').$(),
        e('InteractorError', 'could not find .c')
      );
    });

    describe('with a string selector', () => {
      it('returns the element within the interactor', () => {
        assert.equal(
          Interactor('.a').$('.b'),
          document.querySelector('.a .b')
        );
      });

      it('throws when the selector cannot be found', () => {
        assert.throws(
          () => Interactor('.b').$('.c'),
          e('InteractorError', 'could not find .c within .b')
        );
      });
    });

    describe('with a selector function', () => {
      it('provides the containing element as an argument', () => {
        assert.doesNotThrow(() => {
          Interactor('.a').$($a => {
            assert.equal($a, document.querySelector('.a'));
            return $a;
          });
        });
      });

      it('returns the element from the selector function', () => {
        assert.equal(
          Interactor('.a').$($a => $a.firstElementChild),
          document.querySelector('.a .b')
        );
      });

      it('throws when the selector function does', () => {
        assert.throws(
          () => Interactor('.a').$(() => assert(false)),
          e('AssertionError', 'false == true')
        );
      });

      it('throws when the selector function returns falsey', () => {
        let fn = () => false;
        fn.toString = () => 'fn';

        assert.throws(
          () => Interactor('.a').$(fn),
          e('InteractorError', 'could not find fn within .a')
        );
      });
    });

    describe('with an interactor selector', () => {
      it('returns the selector interactor element', () => {
        assert.equal(
          Interactor('.a').$(Interactor('.b')),
          document.querySelector('.a .b')
        );
      });

      it('throws an error with queued actions', () => {
        assert.throws(
          () => Interactor('.a').$(Interactor('.b').exec()),
          e('InteractorError', 'the provided interactor must not have queued actions')
        );
      });

      it('throws when the interactor cannot be found', () => {
        assert.throws(
          () => Interactor('.b').$(Interactor('.c')),
          e('InteractorError', 'could not find .c within .b')
        );
      });
    });

    describe('with an unknown selector', () => {
      it('throws an unknown selector error', () => {
        assert.throws(
          () => Interactor('.a').$({}),
          e('InteractorError', 'unknown selector: [object Object]')
        );
      });
    });

    describe('with other document roots', () => {
      const Frame = Interactor.extend();

      beforeEach(done => {
        fixture(`
          <div class="div foo"></div>
          <iframe
            class="test-frame"
            srcdoc="<div class='div bar'></div>"
          ></iframe>
        `);

        listen('.test-frame', 'load', function() {
          Frame.dom = this.contentWindow;
          done();
        });
      });

      it('works with alternate dom references', () => {
        assert.equal(
          Interactor('.div').$(),
          document.querySelector('.div.foo')
        );

        assert.throws(
          () => Interactor('.div.bar').$(),
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
          Interactor('.test-frame').$('.div.bar'),
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
          () => Interactor('.test-frame').$('.div.bar'),
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
        Interactor('.list').$$('.item'),
        Array.from(document.querySelectorAll('.list .item'))
      );
    });

    it('throws an error when missing a selector', () => {
      assert.throws(
        () => Interactor('.item').$$(),
        e('InteractorError', 'cannot query for multiple elements without a selector')
      );
    });

    describe('with a selector function', () => {
      it('provides a second truthy argument for multiple elements', () => {
        assert.doesNotThrow(() => {
          Interactor('.list').$$(($list, multiple) => {
            assert.equal($list, document.querySelector('.list'));
            assert.equal(multiple, true);
            return $list.children;
          });
        });
      });
    });
  });

  describe('timeout([ms])', () => {
    const interactor = Interactor();

    it('returns the interactor timeout', () => {
      assert.equal(interactor.timeout(), 2000);
    });

    describe('with a custom timeout', () => {
      it('sets a new interactor timeout', () => {
        let next = interactor.timeout(1000);
        assert.notEqual(next, interactor);
        assert.instanceOf(next, Interactor);
        assert.equal(next.timeout(), 1000);
      });
    });
  });

  describe('find(selector)', () => {
    const Foo = Interactor.extend();
    const Bar = Interactor.extend();

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
      assert.instanceOf(next, Interactor);
      assert.instanceOf(next.exec(), Foo);
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
      await Interactor().assert(() => (called = true));
      assert.equal(called, true);
    });
  });

  describe('exec([callback])', () => {
    it('adds the callback to the next queue', async () => {
      let called = false;
      await Interactor().exec(() => (called = true));
      assert.equal(called, true);
    });

    describe('without a callback', () => {
      it('separates and executes sequential assertions', async () => {
        let count = 0;

        await assert.doesNotReject(
          Interactor().timeout(100)
            .assert(() => (count += 1))
            .assert(() => assert.equal(count, 5))
            .exec()
            .assert(() => (count *= 2))
            .assert(() => assert.equal(count, 40))
        );
      });
    });

    describe('with an interactor action', () => {
      const Foo = Interactor.extend();
      const Bar = Interactor.extend();

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

      await Interactor()
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
          Interactor()
            .exec(() => { throw Interactor.error('test'); })
            .catch('there was an error: %{e}')
            .exec(() => (called = true)),
          e('InteractorError', 'there was an error: test')
        );

        assert.equal(called, false);
      });

      it('does not format other thrown errors', async () => {
        let called = false;

        await assert.rejects(
          Interactor()
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
      let interactor = Interactor().exec(() => (called = true));

      assert.equal(called, false);
      await interactor;
      assert.equal(called, true);
    });

    it('starts executing the instance queue', async () => {
      let calls = 0;
      let interactor = Interactor()
        .exec(() => calls++)
        .assert(() => assert.equal(calls, 1))
        .exec(() => calls++);

      assert.equal(calls, 0);
      await assert.doesNotReject(interactor);
      assert.equal(calls, 2);
    });

    it('binds each action to the associated instance', async () => {
      let interactor = Interactor();

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
        Interactor('.a')
          .exec($el => ($el.innerText = 'A'))
          .assert($el => assert.equal($el.innerText, 'A'))
      );

      let called = false;

      await assert.rejects(
        Interactor('.b').timeout(100)
          .exec(() => (called = true))
          .assert($el => assert.equal($el.className, 'b')),
        e('InteractorError', 'could not find .b')
      );

      assert.equal(called, true);
    });

    it('repeatedly runs sequential assertions until passing', async () => {
      let count = 0;

      await assert.doesNotReject(
        Interactor().timeout(100)
          .assert(() => (count += 1))
          .assert(() => assert.equal(count, 5))
      );
    });

    it('persists previous assertions with remains', async () => {
      let time = Date.now();
      let delta = 0;

      await assert.doesNotReject(
        Interactor()
          .assert(() => (delta += Date.now() - time))
          .assert(() => (time = Date.now()))
          .assert.remains(100)
      );

      assert(delta > 100 && delta < 120, (
        new assert.AssertionError({
          message: `100 < ${delta} < 120`
        })
      ));
    });

    it('runs the previous assertions before executing callbacks', async () => {
      let count = 0;

      await assert.doesNotReject(
        Interactor().timeout(100)
          .assert(() => (count += 1))
          .assert(() => assert.equal(count, 5))
          .exec(() => (count *= 2))
      );

      assert.equal(count, 10);
    });

    it('does not continue the queue when an error is encountered', async () => {
      let called = false;

      await assert.rejects(
        Interactor()
          .exec(() => { throw new Error('test'); })
          .exec(() => (called = true)),
        e('Error', 'test')
      );

      await assert.rejects(
        Interactor().timeout(100)
          .assert(() => { throw new Error('test'); })
          .exec(() => (called = true)),
        e('Error', 'test')
      );

      assert.equal(called, false);
    });

    it('formats thrown interactor errors', async () => {
      await assert.rejects(
        Interactor('foo').exec(function() {
          return this.find('test').exec(() => {
            throw Interactor.error('%{@} bar %{!!} baz %{- qux}', true);
          });
        }),
        e('InteractorError', 'test within foo bar baz')
      );
    });
  });

  describe('toString', () => {
    it('references the interactor\'s selector', () => {
      assert.equal(Interactor('.foo').toString(), '.foo');
    });

    it('references custom interactor names', () => {
      let Custom = Interactor.extend({ interactor: { name: 'element' } });
      assert.equal(Custom('.bar').toString(), '.bar element');

      let CustomInherit = Custom.extend();
      assert.equal(CustomInherit('.bar').toString(), '.bar element');

      let CustomOverride = Custom.extend({ interactor: { name: 'qux' } });
      assert.equal(CustomOverride('.baz').toString(), '.baz qux');
    });

    it('references any parent instance', () => {
      assert.equal(
        Interactor('.bar').find('.foo').toString(),
        '.foo within .bar'
      );
    });
  });
});
