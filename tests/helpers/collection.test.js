import expect from 'expect';

import { $, injectHtml, testDOMEvent } from '../helpers';
import interactor, { collection, text, click } from 'interactor.js';

describe('Interactor helpers - collection', () => {
  @interactor class ItemInteractor {
    content = text('.test-p');
    click = click('button');
  }

  @interactor class CollectionInteractor {
    static defaultScope = 'ul';
    simple = collection('.test-item');

    items = collection('.test-item', {
      content: text('.test-p')
    });

    byClassName = collection(
      classname => classname ? `.${classname}` : '.test-item',
      ItemInteractor
    );
  }

  let test = new CollectionInteractor().timeout(50);

  beforeEach(() => {
    injectHtml(`
      <ul>
        <li class="test-item a">
          <p class="test-p">Item A</p>
          <button>Button A</button>
        </li>
        <li class="test-item b">
          <p class="test-p">Item B</p>
          <button>Button B</button>
        </li>
        <li class="test-item c">
          <p class="test-p">Item C</p>
          <button>Button C</button>
        </li>
        <li class="test-item d">
          <p class="test-p">Item D</p>
          <button>Button D</button>
        </li>
      </ul>
    `);
  });

  it('has collection methods', () => {
    expect(test).toHaveProperty('simple', expect.any(Function));
    expect(test).toHaveProperty('items', expect.any(Function));
    expect(test).toHaveProperty('byClassName', expect.any(Function));
  });

  it('returns an interactor scoped to the element at an index', () => {
    expect(test.simple(0).$element).toBe($('.test-item.a'));
    expect(test.items(1).$element).toBe($('.test-item.b'));
  });

  it('returns an interactor scoped to the element by a generated selector', () => {
    expect(test.byClassName('c').$element).toBe($('.test-item.c'));
  });

  it('returns an array of interactors when no argument is provided', () => {
    expect(test.simple()).toBeInstanceOf(Array);
    expect(test.simple()).toHaveLength(4);
    expect(test.items()).toBeInstanceOf(Array);
    expect(test.items()).toHaveLength(4);
    expect(test.byClassName()).toBeInstanceOf(Array);
    expect(test.byClassName()).toHaveLength(4);
    test.byClassName().forEach(item => {
      expect(item).toBeInstanceOf(ItemInteractor);
      expect(item.$element.classList.contains('test-item')).toBe(true);
    });
  });

  it('has nested interactions', () => {
    expect(test.items(1)).toHaveProperty('content');
    expect(test.byClassName('a')).toBeInstanceOf(ItemInteractor);
    expect(test.byClassName('b')).toHaveProperty('content');
    expect(test.byClassName('c')).toHaveProperty('click', expect.any(Function));
  });

  it('has a scoped text property', () => {
    expect(test.byClassName('d')).toHaveProperty('content', 'Item D');
  });

  it('has scoped clickable properties', async () => {
    let a = testDOMEvent('.a button', 'click');
    await expect(test.byClassName('a').click()).resolves.toBeUndefined();
    expect(a.result).toBe(true);
  });

  it('returns new parent instances from collection methods', () => {
    expect(test.items(0).click()).not.toBe(test);
    expect(test.items(0).click()).toBeInstanceOf(CollectionInteractor);
  });

  it('has nested collection assertions', async () => {
    await expect(test.items(0).assert.matches('.a')).resolves.toBeUndefined();
    await expect(test.assert.items(0).matches('.a')).resolves.toBeUndefined();
  });

  it('has a nested count assertion when given no arguments', async () => {
    await expect(test.assert.items().count(4)).resolves.toBeUndefined();
    await expect(test.assert.items().not.count(5)).resolves.toBeUndefined();
    await expect(test.assert.items().count(5))
      .rejects.toThrow('found 4 ".test-item" elements but expected 5');
    await expect(test.assert.items().not.count(4))
      .rejects.toThrow('found 4 ".test-item" elements');
  });

  it('returns new parent instances from collection assertions', () => {
    expect(test.items(0).assert.matches('.a')).toBeInstanceOf(CollectionInteractor);
    expect(test.assert.items(0).matches('.a')).toBeInstanceOf(CollectionInteractor);
    expect(test.assert.items().count(4)).toBeInstanceOf(CollectionInteractor);
  });

  it('throws scoped assertion errors for computed selectors', async () => {
    await expect(test.assert.byClassName('a').matches('.b'))
      .rejects.toThrow('".a" assertion failed');
  });

  it('returns own instances from collection methods after calling #only', () => {
    expect(test.byClassName('a').only()).toBeInstanceOf(ItemInteractor);
    expect(test.byClassName('a').only().click()).toBeInstanceOf(ItemInteractor);
  });

  it('lazily throws an error when the element does not exist', () => {
    let item = test.items(99);
    expect(() => item.$element)
      .toThrow('unable to find ".test-item" at index 99');
  });
});
