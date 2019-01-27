import expect from 'expect';

import interactor from '../src/decorator';
import validation from '../src/utils/validation';

describe('Interactor validations', () => {
  let instance, pass;

  @interactor class CustomInteractor {
    passing = validation(() => {
      expect(pass).toBe(true);
    });
    failing = validation(() => {
      expect(pass).toBe(false);
    });
    multiple = validation(['passing', '!failing']);
    complex = validation((validate, element) => {
      expect(element).toBeInstanceOf(Element);
      return validate('multiple');
    });
    errored = validation('!passing', 'custom error', 'negated error');
  }

  beforeEach(() => {
    instance = new CustomInteractor({ timeout: 50 });
    pass = false;
  });

  describe('computed properties', () => {
    it('returns true with successful validations', () => {
      expect(instance.failing).toBe(true);
      pass = true;
      expect(instance.passing).toBe(true);
    });

    it('returns false with failing validations', () => {
      expect(instance.passing).toBe(false);
      pass = true;
      expect(instance.failing).toBe(false);
    });

    it('returns other validation results', () => {
      expect(instance.complex).toBe(false);
      expect(instance.errored).toBe(true);
      pass = true;
      expect(instance.complex).toBe(true);
      expect(instance.errored).toBe(false);
    });
  });

  describe('the validate method', () => {
    it('eventually resolves when validation passes', async () => {
      setTimeout(() => pass = true, 20);
      await expect(instance.validate(() => {
        expect(pass).toBe(true);
      })).resolves.toBeUndefined();
    });

    it('rejects when validation fails', async () => {
      await expect(instance.validate(() => {
        expect(pass).toBe(true);
      })).rejects.toThrow('expect');
    });

    it('resolves when the property validates successfully', async () => {
      await expect(instance.validate('failing')).resolves.toBeUndefined();
      pass = true;
      await expect(instance.validate('passing')).resolves.toBeUndefined();
    });

    it('resolves when negated proeprties validate successfully', async () => {
      await expect(instance.validate('!passing')).resolves.toBeUndefined();
      pass = true;
      await expect(instance.validate('!failing')).resolves.toBeUndefined();
    });

    it('rejects when the property fails to validate', async () => {
      await expect(instance.validate('passing')).rejects.toThrow('expect');
      pass = true;
      await expect(instance.validate('failing')).rejects.toThrow('expect');
    });

    it('rejects when negated properties fail to validate', async () => {
      await expect(instance.validate('!failing')).rejects.toThrow('returned true');
      pass = true;
      await expect(instance.validate('!passing')).rejects.toThrow('returned true');
    });

    it('accurately validates complex properties', async () => {
      await expect(instance.validate('complex')).rejects.toThrow('expect');
      await expect(instance.validate('!complex')).resolves.toBeUndefined();
      pass = true;
      await expect(instance.validate('complex')).resolves.toBeUndefined();
      await expect(instance.validate('!complex')).rejects.toThrow('returned true');
    });

    it('throws custom errors when specified', async () => {
      await expect(instance.validate('!errored')).rejects.toThrow('negated error');
      pass = true;
      await expect(instance.validate('errored')).rejects.toThrow('custom error');
    });

    it('can validate multiple properties', async () => {
      await expect(instance.validate([
        '!passing', 'failing', '!multiple', '!complex', 'errored'
      ])).resolves.toBeUndefined();
    });

    it('throws the first failed complex computed validation', async () => {
      await expect(instance.validate([
        '!multiple', '!failing', 'passing'
      ])).rejects.toThrow('`failing` returned true');
    });

    it('throws errors using the custom format', async () => {
      await expect(instance.validate('!failing'))
        .rejects.toThrow('CustomInteractor validation failed: `failing` returned true');
      await expect(instance.validate('!failing', '[FAILURE] %e'))
        .rejects.toThrow('[FAILURE] `failing` returned true');
    });

    it('replaces %s with the interactor name or scope when available', async () => {
      await expect(instance.validate('!errored', '%s - %e'))
        .rejects.toThrow('CustomInteractor - negated error');
      instance = new CustomInteractor('.foo').timeout(50);
      await expect(instance.validate('!errored', 'Validating %s failed: %e'))
        .rejects.toThrow('Validating ".foo" failed: negated error');
    });

    it('bubbles errors before generating a new one', async () => {
      await expect(instance.validate('multiple', 'Validating %s failed: %e'))
        .rejects.toThrow(/^expect/);
    });
  });
});
