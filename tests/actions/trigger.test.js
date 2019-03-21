import expect from 'expect';

import { injectHtml, testDOMEvent } from '../helpers';
import { Interactor, trigger } from 'interactor.js';

describe('Interactor actions - trigger', () => {
  beforeEach(() => {
    injectHtml(`
      <div class="test-div">
        <div class="child-div"></div>
      </div>
    `);
  });

  describe('with the default method', () => {
    let div = new Interactor('.test-div');

    it('returns a new interactor instance', () => {
      expect(Interactor.prototype).toHaveProperty('trigger', expect.any(Function));
      expect(div.trigger('myevent')).toBeInstanceOf(Interactor);
    });

    it('eventually triggers an event', async () => {
      let test = testDOMEvent('.test-div', 'myevent');
      await expect(div.trigger('myevent')).resolves.toBeUndefined();
      expect(test.result).toBe(true);
    });

    it('eventually triggers an event with event options', async () => {
      let test = testDOMEvent('.test-div', 'myevent');
      await expect(div.trigger('myevent', { foo: 'bar' })).resolves.toBeUndefined();
      expect(test.result).toBe(true);
      expect(test.event).toHaveProperty('foo', 'bar');
    });

    it('eventually triggers an event on the specified element', async () => {
      let test = testDOMEvent('.child-div', 'myevent');
      await expect(div.trigger('.child-div', 'myevent')).resolves.toBeUndefined();
      expect(test.result).toBe(true);
    });

    it('eventually triggers an event on the specified element with event options', async () => {
      let test = testDOMEvent('.child-div', 'myevent');
      await expect(
        div.trigger('.child-div', 'myevent', { bar: 'baz' })
      ).resolves.toBeUndefined();
      expect(test.result).toBe(true);
      expect(test.event).toHaveProperty('bar', 'baz');
    });
  });

  describe('with the action creator', () => {
    @Interactor.extend class DivInteractor {
      static defaultScope = '.test-div';

      myEvent = foo => trigger('myevent', { foo });
      fooEvent = trigger('.child-div', 'myevent', { foo: true })
        .assert(element => {
          expect(element.classList.contains('child-div')).toBe(true);
        });
    }

    let div = new DivInteractor();

    it('triggers the specified event on the element', async () => {
      let test = testDOMEvent('.test-div', 'myevent');
      await expect(div.myEvent('hello world')).resolves.toBeUndefined();
      expect(test.result).toBe(true);
      expect(test.event).toHaveProperty('foo', 'hello world');
    });

    it('can chain other interactor methods', async () => {
      let test = testDOMEvent('.child-div', 'myevent');
      await expect(div.fooEvent()).resolves.toBeUndefined();
      expect(test.result).toBe(true);
      expect(test.event).toHaveProperty('foo', true);
    });
  });

  describe('using the action directly', () => {
    it('returns an interactor', () => {
      expect(trigger('.test-div', 'myevent')).toBeInstanceOf(Interactor);
    });

    it('eventually triggers an event on the element', async () => {
      let test = testDOMEvent('.test-div', 'myevent');
      await expect(
        trigger('.test-div', 'myevent', { foobar: 'baz' })
      ).resolves.toBeUndefined();
      expect(test.result).toBe(true);
      expect(test.event).toHaveProperty('foobar', 'baz');
    });
  });
});
