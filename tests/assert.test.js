import { assert, e } from 'tests/helpers';
import Interactor from 'interactor.js';

describe('InteractorAssert', () => {
  const Test = Interactor.extend({
    interactor: {
      timeout: 50
    }
  });

  it('is unique per interactor instance', () => {
    assert.notEqual(
      Interactor().assert,
      Interactor().assert
    );
  });

  it('can be negated with .not', async () => {
    let T = Test.extend({
      assert: {
        passing() {
          throw new Error('is failing');
        },

        failing() {}
      }
    });

    await assert.rejects(
      T().assert.not.passing(),
      e('Error', 'is failing')
    );

    await assert.doesNotReject(
      T().assert.not.failing()
    );

    await assert.rejects(
      T().assert.not(() => {}),
      e('InteractorError', 'expected assertion to fail but it passed')
    );

    await assert.doesNotReject(
      T().assert.not(() => {
        throw Error('failed successfully');
      })
    );
  });

  it('defaults .remains to 500ms', async () => {
    let time = Date.now();
    let delta;

    await assert.doesNotReject(
      Test()
        .assert(() => (delta == null && (delta = 10)))
        .assert(() => (delta += Date.now() - time))
        .assert(() => (time = Date.now()))
        .assert.remains()
    );

    assert(delta > 500 && delta < 600, (
      new assert.AssertionError({
        message: `500 < ${delta} < 600`
      })
    ));
  });

  it('throws when calling .remains without a previous assertion', () => {
    assert.throws(
      () => Test().assert.remains(10),
      e('InteractorError', 'no previous assertion to persist')
    );
  });

  it('calls custom assertions with the expected result and provided args', async () => {
    let T = Test.extend({
      assert: {
        passing(expected, bool) {
          assert.equal(expected, bool);
        },

        failing(expected, bool) {
          assert.equal(expected, !bool);
        }
      }
    });

    await assert.doesNotReject(
      T()
        .assert.passing(true)
        .assert.not.failing(true)
    );
  });

  it('handles formatting thrown interactor errors', async () => {
    let T = Test.extend({
      assert: {
        passing(expected, bool) {
          if (expected !== bool) {
            throw Interactor.error('%{@} is %{- failing|passing}');
          }
        }
      }
    });

    await assert.rejects(
      T('foo').assert(() => {
        throw Interactor.error('%{@} is %{- not} passing');
      }),
      e('InteractorError', 'foo is not passing')
    );

    await assert.rejects(
      T('foo').assert.passing(false),
      e('InteractorError', 'foo is failing')
    );

    await assert.rejects(
      T('foo').assert.not.passing(true),
      e('InteractorError', 'foo is passing')
    );
  });

  describe('context', () => {
    it('throws an error when calling interactor methods', async () => {
      let T = Test.extend({
        assert: {
          foo() { this.timeout(); },
          bar() { this.exec(); },
          baz() { this.catch(); },
          qux() { this.then(); }
        }
      });

      let err = e(
        'InteractorError',
        'interactor methods should not be called within assertions'
      );

      await assert.rejects(T().assert.foo(), err);
      await assert.rejects(T().assert.bar(), err);
      await assert.rejects(T().assert.baz(), err);
      await assert.rejects(T().assert.qux(), err);
    });

    it('has access to inherited and shared assertions', async () => {
      let Extended = Test.extend({
        assert: {
          foo(expected, inherited) {
            assert.typeOf(this.assert.bar, (
              inherited ? 'function' : 'undefined'
            ));
          }
        }
      });

      let T = Extended.extend({
        assert: {
          bar() {
            assert.typeOf(this.assert.foo, 'function');
            assert.typeOf(this.assert.not.foo, 'function');
            this.assert.foo(true);

            assert.typeOf(this.assert.child.foo, 'function');
            assert.typeOf(this.assert.not.child.foo, 'function');
            assert.typeOf(this.assert.child.not.foo, 'function');
            assert.typeOf(this.child.assert.foo, 'function');
            assert.typeOf(this.child.assert.not.foo, 'function');
            this.assert.child.not.foo(false);
          }
        },

        child: Extended()
      });

      await assert.rejects(
        T().assert.foo(false)
      );

      await assert.doesNotReject(
        T()
          .assert.foo(true)
          .assert.bar()
      );

      await assert.doesNotReject(
        T().assert(function() {
          assert.typeOf(this.assert.foo, 'function');
          assert.typeOf(this.assert.not.foo, 'function');
          assert.typeOf(this.assert.bar, 'function');
          assert.typeOf(this.assert.not.bar, 'function');
          assert.typeOf(this.assert.child.foo, 'function');
          assert.typeOf(this.assert.not.child.foo, 'function');
          assert.typeOf(this.assert.child.not.foo, 'function');
          assert.typeOf(this.child.assert.foo, 'function');
          assert.typeOf(this.child.assert.not.foo, 'function');
        })
      );
    });
  });
});
