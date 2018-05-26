/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, selectable } from '../../src';

const SelectInteractor = interactor(function() {
  this.selectOption = selectable('.test-select');
});

describe('BigTest Interaction: selectable', () => {
  let test, $select, changed;

  useFixture('select-fixture');

  beforeEach(() => {
    changed = false;
    $select = document.querySelector('.test-select');
    $select.addEventListener('change', () => changed = true);
    test = new SelectInteractor();
  });

  it('has selectable methods', () => {
    expect(test).to.respondTo('select');
    expect(test).to.respondTo('selectOption');
  });

  it('returns a new instance', () => {
    expect(test.select('.test-select')).to.not.equal(test);
    expect(test.select('.test-select')).to.be.an.instanceOf(SelectInteractor);
    expect(test.selectOption('Option 1')).to.not.equal(test);
    expect(test.selectOption('Option 1')).to.be.an.instanceOf(SelectInteractor);
  });

  it('eventually selects the option', async () => {
    await expect(test.select('.test-select', 'Option 1').run()).to.be.fulfilled;
    expect($select.value).to.equal('1');

    $select.value = '';
    await expect(test.selectOption('Option 2').run()).to.be.fulfilled;
    expect($select.value).to.equal('2');
  });

  it('eventually fires a change event', async () => {
    await expect(test.select('.test-select', 'Option 1').run()).to.be.fulfilled;
    expect(changed).to.be.true;

    changed = false;
    await expect(test.selectOption('Option 2').run()).to.be.fulfilled;
    expect(changed).to.be.true;
  });

  it('throws an error when the option cannot be found', async () => {
    await expect(test.selectOption('nothing').timeout(50).run())
      .to.be.rejectedWith('unable to find option "nothing"');
  });

  describe('overwriting the default select method', () => {
    beforeEach(() => {
      test = new (interactor(function() {
        this.select = selectable('.test-select');
      }))();
    });

    it('selects the correct option', async () => {
      await expect(test.select('Option 3').run()).to.be.fulfilled;
      expect($select.value).to.equal('3');
    });
  });
});
