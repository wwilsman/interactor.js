import expect from 'expect';

import interactor from '../src/decorator';
import validation, { validator } from '../src/utils/validation';

describe('Interactor validations', () => {
  let instance, pass;

  @interactor class CustomInteractor {
    passing = validation(() => {
      expect(pass).toBe(true);
    });
    failing = validation(() => {
      expect(pass).toBe(false);
    });
    complex = validation((validate, element) => {
      expect(element).toBeInstanceOf(Element);
      return validate(['passing', '!failing']);
    });
    errored = validation('!passing', 'custom error', 'negated error');
    bubbly = validation(['passing', 'failing']);
  }

  beforeEach(() => {
    instance = new CustomInteractor();
    pass = true;
  });

  describe('getting validation props', () => {
    it('returns boolean values', () => {
      expect(instance.passing).toBe(true);
      expect(instance.failing).toBe(false);
    });

    it('returns validation results', () => {
      expect(instance.complex).toBe(true);
      expect(instance.errored).toBe(false);
    });
  });

  describe('validating instance props', () => {
    let validate;

    describe('without raising errors', () => {
      beforeEach(() => {
        validate = validator(instance);
      });

      it('is bound to the instance and subject', () => {
        expect(validate).toBeInstanceOf(Function);

        expect(validate(function(...args) {
          expect(this).toBe(instance);
          expect(args[0]).toBe(validate);
          expect(args[1]).toBe(instance.$root);
        })).toBe(true);
      });

      it('returns true when passing', () => {
        expect(validate(() => {
          expect(true).toBe(true);
        })).toBe(true);
      });

      it('returns false when failing', () => {
        expect(validate(() => {
          expect(true).toBe(false);
        })).toBe(false);
      });

      it('can validate computed properties by key', () => {
        expect(validate('passing')).toBe(true);
        expect(validate('failing')).toBe(false);
      });

      it('can validate negated computed properties', () => {
        expect(validate('!passing')).toBe(false);
        expect(validate('!failing')).toBe(true);
      });

      it('can validate complex computed properties', () => {
        expect(validate('complex')).toBe(true);
        expect(validate('errored')).toBe(false);
      });

      it('can validate multiple computed properties', () => {
        expect(validate(['passing', '!failing'])).toBe(true);
        expect(validate(['!errored', 'complex'])).toBe(true);
      });
    });

    describe('with errors raised', () => {
      beforeEach(() => {
        validate = validator(instance, { raise: true });
      });

      it('throws an error when false', () => {
        expect(() => validate(() => {
          expect(true).toBe(false);
        })).toThrow('expect(received).toBe(expected)');
      });

      it('throws from computed validations', () => {
        expect(validate('passing')).toBe(true);
        expect(() => validate('failing'))
          .toThrow('expect(received).toBe(expected)');
      });

      it('throws from negated computed validations', () => {
        expect(validate('!failing')).toBe(true);
        expect(() => validate('!passing'))
          .toThrow('CustomInteractor validation failed: `passing` returned true');
      });

      it('throws from nested negated validations', () => {
        expect(() => validate('bubbly'))
          .toThrow('expect(received).toBe(expected)');
      });

      it('throws the first failed complex computed validation', () => {
        expect(() => validate(['passing', '!complex', 'failing']))
          .toThrow('CustomInteractor validation failed: `complex` returned true');
      });

      it('throws a custom validation error message', () => {
        expect(() => validate('errored'))
          .toThrow('CustomInteractor validation failed: custom error');
      });

      it('throws a different custom validation error message when negated', () => {
        pass = false;
        expect(() => validate('!errored'))
          .toThrow('CustomInteractor validation failed: negated error');
      });
    });

    describe('with errors raised and a custom format', () => {
      it('throws errors using the custom format', () => {
        validate = validator(instance, {
          raise: true,
          format: '%s - %e'
        });

        expect(() => validate('!passing'))
          .toThrow('CustomInteractor - `passing` returned true');
        expect(() => validate('errored'))
          .toThrow('CustomInteractor - custom error');
      });

      it('replaces %s with the scope selector when available', () => {
        instance = new CustomInteractor('.foo');
        validate = validator(instance, {
          raise: true,
          format: 'Validating %s failed: %e'
        });

        expect(() => validate('!passing'))
          .toThrow('Validating ".foo" failed: `passing` returned true');
        expect(() => validate('errored'))
          .toThrow('Validating ".foo" failed: custom error');
      });
    });
  });

  describe('using the validate method', () => {
    beforeEach(() => {
      pass = false;
    });

    it('eventually passes validation', async () => {
      setTimeout(() => pass = true, 50);
      await expect(instance.validate('passing').run()).resolves.toBeTruthy();
      setTimeout(() => pass = false, 50);
      await expect(instance.validate('failing').run()).resolves.toBeTruthy();
    });

    it('eventually throws when it does not pass', async () => {
      instance = instance.timeout(50);
      await expect(instance.validate('passing').run()).rejects.toThrow();
    });
  });
});
