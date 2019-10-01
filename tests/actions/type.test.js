import expect from 'expect';

import { injectHtml, testDOMEvent } from '../helpers';
import interactor, { Interactor, type } from 'interactor.js';

describe('Interactor actions - type', () => {
  beforeEach(() => {
    injectHtml(`
      <input class="input"/>
      <textarea class="textarea"></textarea>
      <div class="editable" contenteditable></div>
      <div class="noneditable"></div>
    `);
  });

  describe('with the default method', () => {
    it('returns a new interactor instance', () => {
      expect(Interactor.prototype).toHaveProperty('type', expect.any(Function));
      expect(new Interactor().type()).toBeInstanceOf(Interactor);
    });

    it('can type into input elements', async () => {
      let down = testDOMEvent('.input', 'keydown');
      let press = testDOMEvent('.input', 'keypress');
      let inp = testDOMEvent('.input', 'input');
      let up = testDOMEvent('.input', 'keyup');

      let input = new Interactor('.input');
      await expect(input.type('hello!')).resolves.toBeUndefined();

      expect(input.$element.value).toBe('hello!');
      expect(down.result).toBe(true);
      expect(press.result).toBe(true);
      expect(inp.result).toBe(true);
      expect(up.result).toBe(true);
    });

    it('can type into textarea elements', async () => {
      let down = testDOMEvent('.textarea', 'keydown');
      let press = testDOMEvent('.textarea', 'keypress');
      let input = testDOMEvent('.textarea', 'input');
      let up = testDOMEvent('.textarea', 'keyup');

      let textarea = new Interactor();
      await expect(textarea.type('.textarea', 'heyoo!')).resolves.toBeUndefined();

      expect(input.$element.value).toBe('heyoo!');
      expect(down.result).toBe(true);
      expect(press.result).toBe(true);
      expect(input.result).toBe(true);
      expect(up.result).toBe(true);
    });

    // content-editable is not supported in jsdom
    it.skip.jsdom('can type into contenteditable elements', async () => {
      let down = testDOMEvent('.editable', 'keydown');
      let press = testDOMEvent('.editable', 'keypress');
      let input = testDOMEvent('.editable', 'input');
      let up = testDOMEvent('.editable', 'keyup');

      let editable = new Interactor('.editable');
      await expect(editable.type('foo bar')).resolves.toBeUndefined();

      expect(editable.$element.textContent).toBe('foo bar');
      expect(down.result).toBe(true);
      expect(press.result).toBe(true);
      expect(input.result).toBe(true);
      expect(up.result).toBe(true);
    });

    it('throws an error on disabled inputs', async () => {
      let input = new Interactor('.input').timeout(50);
      input.$element.disabled = true;
      await expect(input.type('disabled?')).rejects.toThrow('disabled');
    });

    it('throws an error on non-typable elements', async () => {
      let noneditable = new Interactor('.noneditable').timeout(50);
      await expect(noneditable.type('hello?')).rejects
        .toThrow('not an input, textarea, or content editable element');
    });

    it('can prevent a keypress event', async () => {
      let down = testDOMEvent('.input', 'keydown', e => e.preventDefault());
      let press = testDOMEvent('.input', 'keypress');
      let inp = testDOMEvent('.input', 'input');
      let up = testDOMEvent('.input', 'keyup');

      let input = new Interactor('.input');
      await expect(input.type('no keypress')).resolves.toBeUndefined();

      expect(input.$element.value).toBe('');
      expect(down.result).toBe(true);
      expect(press.result).toBe(false);
      expect(inp.result).toBe(false);
      expect(up.result).toBe(true);
    });

    it('can prevent an input event', async () => {
      let down = testDOMEvent('.input', 'keydown');
      let press = testDOMEvent('.input', 'keypress', e => e.preventDefault());
      let inp = testDOMEvent('.input', 'input');
      let up = testDOMEvent('.input', 'keyup');

      let input = new Interactor('.input');
      await expect(input.type('no input')).resolves.toBeUndefined();

      expect(input.$element.value).toBe('');
      expect(down.result).toBe(true);
      expect(press.result).toBe(true);
      expect(inp.result).toBe(false);
      expect(up.result).toBe(true);
    });

    it('can delay between typing characters', async () => {
      let start = Date.now();
      let input = new Interactor('.input');
      await expect(input.type('abc', { delay: 50 })).resolves.toBeUndefined();
      expect(Date.now() - start).toBeGreaterThanOrEqual(100);
    });

    // better to generate these rather than copy-paste
    [ { name: 'alt', key: 'Alt' },
      { name: 'ctrl', key: 'Control' },
      { name: 'meta', key: 'Meta' },
      { name: 'shift', key: 'Shift' }
    ].forEach(({ name, key }) => {
      it(`types with the ${name} key down`, async () => {
        let test = testDOMEvent('.input', 'input');
        let input = new Interactor('.input');

        await expect(
          input.keydown(key).type('x')
        ).resolves.toBeUndefined();

        expect(input.$element.value).toBe('x');
        expect(test.event).toHaveProperty(`${name}Key`, true);

        await expect(
          input
            .keydown(key).type('y')
            .keyup(key).type('z')
        ).resolves.toBeUndefined();

        expect(input.$element.value).toBe('xyz');
        expect(test.event).toHaveProperty(`${name}Key`, false);
      });
    });

    it('can type within a range', async () => {
      let input = new Interactor('.input');
      await input.type('helorld');

      await expect(input.type('lo w', { range: 3 })).resolves.toBeUndefined();
      expect(input.$element.value).toBe('hello world');

      await expect(input.type('HELLO', { range: [0, 5] })).resolves.toBeUndefined();
      expect(input.$element.value).toBe('HELLO world');
    });

    it('triggers a beforeinput event', async () => {
      let val = [];

      let before = testDOMEvent('.input', 'beforeinput', e => val[0] = e.target.value);
      let inp = testDOMEvent('.input', 'input', e => val[1] = e.target.value);

      let input = new Interactor('.input');
      await expect(input.type('a')).resolves.toBeUndefined();

      expect(val[0]).toBe('');
      expect(before.result).toBe(true);
      expect(val[1]).toBe('a');
      expect(inp.result).toBe(true);
    });

    it('can cancel a beforeinput event', async () => {
      let before = testDOMEvent('.input', 'beforeinput', e => e.preventDefault());
      let inp = testDOMEvent('.input', 'input');

      let input = new Interactor('.input');
      await expect(input.type('a')).resolves.toBeUndefined();

      expect(before.result).toBe(true);
      expect(inp.result).toBe(false);
    });

    it('can trigger a change event', async () => {
      let n = 0;
      let change = testDOMEvent('.input', 'change', () => n++);

      let input = new Interactor('.input');
      await expect(input.type('change', { change: true })).resolves.toBeUndefined();

      expect(input.$element.value).toBe('change');
      expect(change.result).toBe(true);
      expect(n).toBe(1);
    });

    it('sends a space code with the space character', async () => {
      let inp = testDOMEvent('.input', 'input');

      let input = new Interactor('.input');
      await expect(input.type(' ')).resolves.toBeUndefined();

      expect(input.$element.value).toBe(' ');
      expect(inp.result).toBe(true);
      expect(inp.event).toHaveProperty('code', 'Space');
      expect(inp.event).toHaveProperty('charCode', 32);
    });

    it('temporarily removes custom value descriptors', async () => {
      let input = new Interactor('.input');
      let triggered = false;

      let { get } = Object.getOwnPropertyDescriptor(
        input.$element.constructor.prototype,
        'value'
      );

      Object.defineProperty(input.$element, 'value', {
        enumerable: true,
        configurable: true,
        set: () => triggered = true,
        get: () => 'F'
      });

      await expect(input.type('A')).resolves.toBeUndefined();
      expect(input.$element.value).toBe('F');
      expect(get.call(input.$element)).toBe('A');
      expect(triggered).toBe(false);
    });
  });

  describe('with the action creator', () => {
    @interactor class InputInteractor {
      static defaultScope = '.input';

      type = val => type(val, { change: true });
      typeit = type('it').assert(element => {
        expect(element.value).toBe('it');
      });
    }

    let input = new InputInteractor();

    it('types into the element', async () => {
      let test = testDOMEvent('.input', 'change');
      await expect(input.type('hello world')).resolves.toBeUndefined();
      expect(input.$element.value).toBe('hello world');
      expect(test.result).toBe(true);
    });

    it('can chain other interactor methods', async () => {
      let test = testDOMEvent('.input', 'input');
      await expect(input.typeit()).resolves.toBeUndefined();
      expect(input.$element.value).toBe('it');
      expect(test.result).toBe(true);
    });
  });

  describe('using the action directly', () => {
    it('returns an interactor', () => {
      expect(type('.input', 'ayyy')).toBeInstanceOf(Interactor);
    });

    it('eventually types into the element', async () => {
      let test = testDOMEvent('.input', 'change');

      await expect(
        type('.input', 'ayo', { change: true })
      ).resolves.toBeUndefined();

      expect(test.$element.value).toBe('ayo');
      expect(test.result).toBe(true);
    });
  });
});
