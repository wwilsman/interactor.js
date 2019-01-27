import expect from 'expect';

import { injectHtml } from '../helpers';
import Interactor from '../../src/interactor';
import scoped from '../../src/properties/scoped';

describe('Interactor properties - scoped', () => {
  @Interactor.extend class PInteractor {
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
      expect(test.do(() => {}).$element.id).toBe('scoped');
    });

    it('uses defined properties for the scoped interactor', () => {
      let test = new Interactor().scoped('.test-p', { foo: true });
      expect(test).toHaveProperty('foo', true);
      expect(test.do(() => {})).not.toHaveProperty('foo');
    });

    it('uses an interactor class for the scoped interactor', () => {
      let test = new Interactor('#scoped').scoped('.test-p', PInteractor);
      expect(test).toHaveProperty('b', true);
      expect(test.do(() => {})).not.toHaveProperty('b');
    });

    it('can optionally opt out of parent chaining', () => {
      let test = new Interactor().scoped('.test-p', PInteractor, false);
      expect(test).toHaveProperty('a', true);
      expect(test.do(() => {})).toHaveProperty('b', false);
    });
  });

  describe('the property creator', () => {
    @Interactor.extend class ScopedInteractor {
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
  });
});
