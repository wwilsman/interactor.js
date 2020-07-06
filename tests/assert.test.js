import { assert, e } from 'tests/helpers';
import Interactor from 'interactor.js';

describe('InteractorAssert', () => {
  it('is unique per interactor instance', () => {
    assert.notEqual(
      Interactor().assert,
      Interactor().assert
    );
  });

  it('can be negated with .not', async () => {
    let Test = Interactor.extend({
      interactor: {
        timeout: 50
      },

      assert: {
        passing() {
          throw new Error('is failing');
        },

        failing() {}
      }
    });

    await assert.rejects(
      Test().assert.not.passing(),
      e('Error', 'is failing')
    );

    await assert.doesNotReject(
      Test().assert.not.failing()
    );

    await assert.rejects(
      Test().assert.not(() => {}),
      e('InteractorError', 'expected assertion to fail but it passed')
    );

    await assert.doesNotReject(
      Test().assert.not(() => {
        throw Error('failed successfully');
      })
    );
  });

  it('defaults .remains to 500ms', async () => {
    let time = Date.now();
    let delta;

    await assert.doesNotReject(
      Interactor()
        .assert(() => (delta == null && (delta = 1)))
        .assert(() => (delta += Date.now() - time))
        .assert(() => (time = Date.now()))
        .assert.remains()
    );

    assert(delta > 500 && delta < 600);
  });

  it('throws when calling .remains without a previous assertion', () => {
    assert.throws(
      () => Interactor().assert.remains(10),
      e('InteractorError', 'no previous assertion to persist')
    );
  });

  it('calls custom assertions with the expected result and provided args', async () => {
    let Test = Interactor.extend({
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
      Test()
        .assert.passing(true)
        .assert.not.failing(true)
    );
  });

  it('handles formatting thrown interactor errors', async () => {
    let Test = Interactor.extend({
      interactor: {
        timeout: 50
      },

      assert: {
        passing(expected, bool) {
          if (expected !== bool) {
            throw Interactor.error('%{@} is %{- failing|passing}');
          }
        }
      }
    });

    await assert.rejects(
      Test('foo').assert(() => {
        throw Interactor.error('%{@} is %{- not} passing');
      }),
      e('InteractorError', 'foo is not passing')
    );

    await assert.rejects(
      Test('foo').assert.passing(false),
      e('InteractorError', 'foo is failing')
    );

    await assert.rejects(
      Test('foo').assert.not.passing(true),
      e('InteractorError', 'foo is passing')
    );
  });

  it('provides assertions with a smart context', async () => {
    let Extended = Interactor.extend({
      assert: {
        something(expected, inherited) {
          assert.typeOf(this.not, 'object');
          assert.typeOf(this.remains, 'undefined');

          assert.typeOf(this.something, 'function');
          assert.typeOf(this.not.something, 'function');

          assert.typeOf(this.passing, (
            inherited ? 'function' : 'undefined'
          ));
        }
      }
    });

    let Test = Extended.extend({
      assert: {
        passing() {
          assert.typeOf(this.not, 'object');
          assert.typeOf(this.remains, 'undefined');

          assert.typeOf(this.passing, 'function');
          assert.typeOf(this.not.passing, 'function');

          assert.typeOf(this.something, 'function');
          assert.typeOf(this.not.something, 'function');
          this.something(true);

          assert.typeOf(this.child.something, 'function');
          assert.typeOf(this.not.child.something, 'function');
          assert.typeOf(this.child.not.something, 'function');
          this.child.not.something(false);
        }
      },

      child: Extended()
    });

    await assert.doesNotReject(
      Test().assert.passing()
    );

    await assert.doesNotReject(
      Test().assert(function() {
        assert.typeOf(this.not, 'object');
        assert.typeOf(this.remains, 'undefined');
        assert.typeOf(this.passing, 'function');
        assert.typeOf(this.not.passing, 'function');
        assert.typeOf(this.something, 'function');
        assert.typeOf(this.not.something, 'function');
        assert.typeOf(this.child.something, 'function');
        assert.typeOf(this.not.child.something, 'function');
        assert.typeOf(this.child.not.something, 'function');
      })
    );
  });
});
