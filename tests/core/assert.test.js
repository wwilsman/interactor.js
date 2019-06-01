import expect from 'expect';

import interactor from 'interactor.js';

const { now } = Date;

describe('Interactor assertions', () => {
  let instance, pass;

  @interactor class CustomInteractor {
    static assertions = {
      passing: () => pass === true,
      failing: () => pass === false,

      finished: () => ({
        result: pass != null,
        message: () => `pass === ${pass}`
      }),

      even: n => {
        let result = !(n % 2);

        return {
          result,
          message: () => `${n} is ${result ? '' : 'not '}even`
        };
      },

      throws: () => {
        expect(pass).toBe(true);
      }
    };

    get computed() {
      return 'hello world';
    }
  }

  beforeEach(() => {
    instance = new CustomInteractor(50);
    pass = null;
  });

  it('has an assert function', () => {
    expect(instance.assert).toBeInstanceOf(Function);
  });

  it('has custom assertions', () => {
    expect(instance.assert).toHaveProperty('passing', expect.any(Function));
    expect(instance.assert).toHaveProperty('failing', expect.any(Function));
    expect(instance.assert).toHaveProperty('finished', expect.any(Function));
    expect(instance.assert).toHaveProperty('even', expect.any(Function));
    expect(instance.assert).toHaveProperty('throws', expect.any(Function));
  });

  it('has computed property assertions', () => {
    expect(instance.assert).toHaveProperty('computed', expect.any(Function));
  });

  describe('making assertions', () => {
    it('resolves when passing', async () => {
      await expect(instance.assert(() => expect(pass).toBeNull()))
        .resolves.toBeUndefined();

      pass = true;
      await expect(instance.assert.passing()).resolves.toBeUndefined();
      await expect(instance.assert.finished()).resolves.toBeUndefined();

      pass = false;
      await expect(instance.assert.failing()).resolves.toBeUndefined();
      await expect(instance.assert.finished()).resolves.toBeUndefined();

      await expect(instance.assert.computed('hello world'))
        .resolves.toBeUndefined();
    });

    it('rejects when failing', async () => {
      await expect(instance.assert(() => expect(pass).not.toBeNull()))
        .rejects.toThrow('expect(received).not.toBeNull()');
      await expect(instance.assert.passing()).rejects.toThrow('`passing` returned false');
      await expect(instance.assert.failing()).rejects.toThrow('`failing` returned false');
      await expect(instance.assert.computed(20))
        .rejects.toThrow('`computed` is "hello world" but expected 20');
    });

    it('rejects with a custom message when specified', async () => {
      await expect(instance.assert.finished()).rejects.toThrow('pass === null');
    });

    it('accepts arguments to validate', async () => {
      await expect(instance.assert.even(2)).resolves.toBeUndefined();
      await expect(instance.assert.even(3)).rejects.toThrow('3 is not even');
    });

    it('bubbles error messages', async () => {
      await expect(instance.assert.throws()).rejects.toThrow('expect(received).toBe(expected)');
    });

    it('rejects when an async function is used', async () => {
      await expect(instance.assert(async () => {})).rejects.toThrow('async');
      await expect(instance.assert(() => Promise.resolve())).rejects.toThrow('promise');
    });
  });

  describe('negating assertions with `.not`', () => {
    it('resolves when passing', async () => {
      await expect(instance.assert.not.passing()).resolves.toBeUndefined();
      await expect(instance.assert.not.failing()).resolves.toBeUndefined();
      await expect(instance.assert.not.finished()).resolves.toBeUndefined();
    });

    it('rejects when failing', async () => {
      pass = true;
      await expect(instance.assert.not.passing()).rejects.toThrow('`passing` returned true');
      pass = false;
      await expect(instance.assert.not.failing()).rejects.toThrow('`failing` returned true');
    });

    it('rejects with a custom message when specified', async () => {
      pass = true;
      await expect(instance.assert.not.finished()).rejects.toThrow('pass === true');
      pass = false;
      await expect(instance.assert.not.finished()).rejects.toThrow('pass === false');
    });

    it('accepts arguments to validate', async () => {
      await expect(instance.assert.not.even(3)).resolves.toBeUndefined();
      await expect(instance.assert.not.even(2)).rejects.toThrow('2 is even');
    });

    it('has a default error message when nothing is returned', async () => {
      pass = true;
      await expect(instance.assert.not.throws())
        .rejects.toThrow('`throws` did not throw an error');
    });

    it('always rejects when specific errors occur', async () => {
      await expect(
        instance.assert.not.disabled('#not-found')
      ).rejects.toThrow('unable to find "#not-found"');
      await expect(
        instance.assert.not.disabled('!wrong')
      ).rejects.toThrow('"!wrong" is not a valid selector');
    });
  });

  describe('chaining assertions', () => {
    it('resolves when all assertions are passing', async () => {
      pass = true;

      await expect(
        instance
          .assert.passing()
          .assert.not.failing()
          .assert.finished()
      ).resolves.toBeUndefined();
    });

    it('rejects when any assertions are failing', async () => {
      pass = true;

      await expect(
        instance
          .assert.passing()
          .assert.failing()
          .assert.finished()
      ).rejects.toThrow('`failing` returned false');
    });

    it('runs grouped assertions at the same time', async () => {
      setTimeout(() => pass = true, 20);
      setTimeout(() => pass = false, 40);

      await expect(
        instance
          .assert.not.finished()
          .assert.validate()
        // the following is grouped
          .assert.passing()
          .assert.not.failing()
          .assert.finished()
          .assert.validate()
        // the following is grouped
          .assert.not.passing()
          .assert.failing()
          .assert.finished()
      ).resolves.toBeUndefined();
    });
  });

  describe('formatting error messages', () => {
    it('has a default format', async () => {
      await expect(instance.assert.passing())
        .rejects.toThrow('CustomInteractor assertion failed: `passing` returned false');
    });

    it('can specify a custom format', async () => {
      await expect(
        instance
          .assert.passing()
          .assert.f('%s Error: %e')
      ).rejects.toThrow('CustomInteractor Error: `passing` returned false');
    });

    it('resets to default after a group of assertions', async () => {
      await expect(
        instance
          .assert.not.passing()
          .assert.f('%s Error: %e')
          .assert.validate()
          .assert.passing()
      ).rejects.toThrow('CustomInteractor assertion failed: `passing` returned false');
    });

    it('uses a specified scope', async () => {
      instance = new CustomInteractor('#scoped').timeout(50);
      await expect(instance.assert.passing())
        .rejects.toThrow('"#scoped" assertion failed');
    });

    it('uses a default scope with no specified scoped', async () => {
      CustomInteractor.defaultScope = '#default';
      await expect(instance.assert.passing())
        .rejects.toThrow('"#default" assertion failed');
    });
  });

  describe('validating over a period of time', () => {
    it('asserts throughout the timeout', async () => {
      let start = now();
      pass = true;

      await expect(
        instance.timeout(200)
          .assert.passing()
          .assert.remains(100)
      ).resolves.toBeUndefined();

      expect(now() - start).toBeGreaterThanOrEqual(100);
    });

    it('waits until passing before asserting it remains passing', async () => {
      let start = now();
      setTimeout(() => pass = true, 50);

      await expect(
        instance.timeout(200)
          .assert.passing()
          .assert.remains(100)
      ).resolves.toBeUndefined();

      expect(now() - start).toBeGreaterThanOrEqual(150);
    });
  });
});
