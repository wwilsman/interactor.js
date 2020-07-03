import { assert, e } from 'tests/helpers';
import Interactor from 'interactor.js';

describe('InteractorAssert', () => {
  it('is unique per interactor instance', () => {
    assert.notEqual(
      Interactor().assert,
      Interactor().assert
    );
  });

  it('has propertiess that cannot be overridden', async () => {
    let mock = msg => (mock.calls = (mock.calls || [])).push(msg);
    let warn = console.warn;
    console.warn = mock;

    let Test = Interactor.extend({
      assert: {
        remains() { throw new Error('remains'); },
        not() { throw new Error('not'); }
      }
    });

    console.warn = warn;
    assert.deepEqual(mock.calls, [
      '`remains` is a reserved assertion property and will be ignored',
      '`not` is a reserved assertion property and will be ignored'
    ]);

    await assert.doesNotReject(
      Test()
        .assert.not(() => {
          throw new Error('assert not');
        })
        .assert.remains(10)
    );
  });

  it('can be negated with .not', async () => {
    let Test = Interactor.extend({
      interactor: {
        timeout: 50
      },

      assert: {
        passing() {},

        failing(expected) {
          throw new Error('is passing');
        }
      }
    });

    await assert.rejects(
      Test().assert.not.passing(),
      e('InteractorError', 'expected assertion to fail but it passed')
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

  it('calls custom assertions with provided args', async () => {
    let Test = Interactor.extend({
      assert: {
        passing(result) {
          assert.equal(result, true);
        },

        failing(result) {
          assert.equal(result, false);
        }
      }
    });

    await assert.doesNotReject(
      Test()
        .assert.passing(true)
        .assert.not.failing(true)
    );
  });

  it('handles formatting and throwing returned interactor errors', async () => {
    let Test = Interactor.extend({
      interactor: {
        timeout: 50
      },

      assert: {
        passing(result) {
          return Interactor.error(
            '%{@} is %{- failing|passing}',
            result
          );
        }
      }
    });

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
        something() {
          assert.typeOf(this.not, 'object');
          assert.typeOf(this.remains, 'undefined');

          assert.typeOf(this.something, 'function');
          assert.typeOf(this.not.something, 'function');

          // passes when inherited, fails when not
          assert.typeOf(this.passing, 'function');
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
          this.something();

          assert.typeOf(this.child.something, 'function');
          assert.typeOf(this.not.child.something, 'function');
          assert.typeOf(this.child.not.something, 'function');
          this.child.not.something();
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
