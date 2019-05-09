import expect from 'expect';

import { injectHtml } from '../helpers';
import interactor, { Interactor, scoped } from 'interactor.js';
import { get } from '../../src/utils/meta';

describe('Interactor helpers - scoped', () => {
  @interactor class PInteractor {
    static defaultScope = '.test-p';
    get a() { return this.$element.innerText === 'A'; }
    get b() { return this.$element.innerText === 'B'; }
  }

  beforeEach(() => {
    injectHtml(`
      <p class="test-p">A</p>
      <div id="scoped">
        <p class="test-p">B</p>
      </div>
    `);
  });

  describe('the scoped method', () => {
    it('returns a new, nested, scoped interactor', () => {
      let test = new Interactor('#scoped').scoped('.test-p');
      expect(test).toBeInstanceOf(Interactor);
      expect(test.$element.innerText).toBe('B');
    });

    it('uses defined properties for the scoped interactor', () => {
      let test = new Interactor().scoped('.test-p', { foo: true });
      expect(test).toHaveProperty('foo', true);
    });

    it('uses an interactor class for the scoped interactor', () => {
      let test = new Interactor('#scoped').scoped('.test-p', PInteractor);
      expect(test).toHaveProperty('b', true);
    });

    it('can optionally opt out of parent chaining', () => {
      let test = new Interactor().scoped('.test-p', PInteractor, false);
      expect(test).toHaveProperty('a', true);
    });
  });

  describe('the property creator', () => {
    @interactor class ScopedInteractor {
      def = scoped('.test-p');
      props = scoped('.test-p', { foo: true });
      p = scoped('.test-p', PInteractor);
    }

    it('scopes with an interactor class by default', () => {
      expect(new ScopedInteractor().def).toBeInstanceOf(Interactor);
      expect(new ScopedInteractor().def.$element.innerText).toBe('A');
      expect(new ScopedInteractor('#scoped').def).toBeInstanceOf(Interactor);
      expect(new ScopedInteractor('#scoped').def.$element.innerText).toBe('B');
    });

    it('can scope with custom properties', () => {
      expect(new ScopedInteractor().props).toHaveProperty('foo', true);
      expect(new ScopedInteractor().props.$element.innerText).toBe('A');
      expect(new ScopedInteractor('#scoped').props).toHaveProperty('foo', true);
      expect(new ScopedInteractor('#scoped').props.$element.innerText).toBe('B');
    });

    it('can scope with a custom interactor class', () => {
      expect(new ScopedInteractor().p).toHaveProperty('a', true);
      expect(new ScopedInteractor().p).toHaveProperty('b', false);
      expect(new ScopedInteractor('#scoped').p).toHaveProperty('a', false);
      expect(new ScopedInteractor('#scoped').p).toHaveProperty('b', true);
    });

    describe('and nested assertions', () => {
      it('returns a parent instance from nested assertions', () => {
        expect(new ScopedInteractor().p.assert.text('A'))
          .toBeInstanceOf(ScopedInteractor);
        expect(new ScopedInteractor().assert.p.text('A'))
          .toBeInstanceOf(ScopedInteractor);
      });

      it('can chain nested assertions', async () => {
        await expect(
          new ScopedInteractor('#scoped')
            .p.assert.not.text('A')
            .assert.p.text('B')
        ).resolves.toBeUndefined();
      });
    });
  });

  describe('using scoped directly', () => {
    it('creates an instance of a given interactor class', () => {
      let test = scoped(PInteractor);
      expect(test).toBeInstanceOf(PInteractor);

      test = scoped('.test-p', PInteractor);
      expect(test).toBeInstanceOf(PInteractor);
      expect(test.$element.innerText).toBe('A');
    });

    it('creates an interactor with the given properties', () => {
      let test = scoped({ foo: true });
      expect(test).toBeInstanceOf(Interactor);
      expect(test.foo).toBe(true);

      test = scoped('.test-p', { foo: true });
      expect(test).toBeInstanceOf(Interactor);
      expect(test.$element.innerText).toBe('A');
      expect(test.foo).toBe(true);
    });
  });

  describe('with an assertion', () => {
    let test = new Interactor().timeout(50);

    it('is scoped to a specific element', async () => {
      await expect(
        test.assert.scoped('#scoped').text('B')
      ).resolves.toBeUndefined();
    });

    it('throw an error with the proper scope', async () => {
      await expect(
        test.assert.scoped('#scoped').not.text('B')
      ).rejects.toThrow('"#scoped" assertion failed: text is "B"');
    });

    it('can be chained with the parent interactor', async () => {
      let next = new Interactor('#scoped');
      expect(get(next, 'assert').validations).toHaveLength(0);

      next = next.trigger('event')
        .assert.scoped('.test-p').text('B');

      expect(get(next, 'assert').validations).toHaveLength(1);
      expect(get(next, 'queue')).toHaveLength(1);

      next = next.trigger('event')
        .assert.attribute('id', 'scoped');

      expect(get(next, 'assert').validations).toHaveLength(1);
      expect(get(next, 'queue')).toHaveLength(3);

      await expect(next).resolves.toBeUndefined();
    });
  });
});
