import { assert, e, fixture } from './helpers';
import Interactor, { t, x } from 'interactor.js';

describe('Selectors', () => {
  beforeEach(() => {
    fixture(`
      <ul class="list">
        <li>Item</li>
        <li>Item</li>
        <li>Item</li>
      </ul>
    `);
  });

  describe('x(xpath)', () => {
    it('can select an element by xpath', () => {
      assert.equal(
        Interactor(x('//ul')).$(),
        document.querySelector('.list')
      );
    });

    it('can select multiple elements by xpath', () => {
      assert.deepEqual(
        Interactor('.list').$$(x('.//li')),
        Array.from(document.querySelectorAll('.list li'))
      );
    });

    it('formats errors from xpath selectors', () => {
      assert.throws(
        () => Interactor(x('//foobar')).$(),
        e('InteractorError', 'could not find x(//foobar)')
      );
    });
  });

  describe('t(text)', () => {
    it('can select an element by text', () => {
      assert.equal(
        Interactor(t('Item')).$(),
        document.querySelector('.list li')
      );
    });

    it('can select multiple elements by text', () => {
      assert.deepEqual(
        Interactor('.list').$$(t('Item')),
        Array.from(document.querySelectorAll('.list li'))
      );
    });

    it('formats errors from text selectors', () => {
      assert.throws(
        () => Interactor(t('Item A')).$(),
        e('InteractorError', 'could not find "Item A"')
      );
    });
  });
});
