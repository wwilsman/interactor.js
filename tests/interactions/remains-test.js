/* global describe, beforeEach, afterEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, remains, hasClass } from '../../src';

@interactor class RemainsInteractor {
  isLoading = hasClass('is-loading');
  beenLoading = remains('isLoading');
  notLoading = remains('!isLoading');
  remainsCustom = remains(() => true);
  remainsCustomFail = remains(() => false);
  remainsMultiple = remains([
    'isLoading',
    () => true
  ]);
}

describe('BigTest Interaction: remains', () => {
  let timeout, test;

  useFixture('click-fixture');

  beforeEach(() => {
    let $btn = document.querySelector('.test-btn');

    timeout = setTimeout(() => {
      $btn.classList.add('is-loading');

      timeout = setTimeout(() => {
        $btn.classList.remove('is-loading');
      }, 100);
    }, 50);

    test = new RemainsInteractor({
      scope: '.test-btn',
      timeout: 70
    });
  });

  afterEach(() => {
    clearTimeout(timeout);
  });

  it('has remains methods', () => {
    expect(test).to.respondTo('remains');
    expect(test).to.respondTo('beenLoading');
    expect(test).to.respondTo('notLoading');
    expect(test).to.respondTo('remainsCustom');
    expect(test).to.respondTo('remainsCustomFail');
    expect(test).to.respondTo('remainsMultiple');
  });

  it('returns a new instance', () => {
    expect(test.remains('isLoading')).to.not.equal(test);
    expect(test.remains('isLoading')).to.be.an.instanceof(RemainsInteractor);
    expect(test.beenLoading()).to.not.equal(test);
    expect(test.beenLoading()).to.be.an.instanceof(RemainsInteractor);
    expect(test.remains('!isLoading')).to.not.equal(test);
    expect(test.remains('!isLoading')).to.be.an.instanceof(RemainsInteractor);
    expect(test.notLoading()).to.not.equal(test);
    expect(test.notLoading()).to.be.an.instanceof(RemainsInteractor);
    expect(test.remains(() => true)).to.not.equal(test);
    expect(test.remains(() => true)).to.be.an.instanceof(RemainsInteractor);
    expect(test.remainsCustom()).to.not.equal(test);
    expect(test.remainsCustom()).to.be.an.instanceof(RemainsInteractor);
    expect(test.remains(['isLoading', () => true])).to.not.equal(test);
    expect(test.remains(['isLoading', () => true])).to.be.an.instanceof(RemainsInteractor);
    expect(test.remainsMultiple()).to.not.equal(test);
    expect(test.remainsMultiple()).to.be.an.instanceof(RemainsInteractor);
  });

  it('continues after the condition passes', async () => {
    await test.validate('isLoading');
    await expect(test.remains('isLoading').run()).to.be.fulfilled;
    await test.validate('!isLoading');
    await expect(test.remains('!isLoading').run()).to.be.fulfilled;
  });

  it('continues when the custom condition passes', async () => {
    await test.validate('isLoading');
    await expect(test.beenLoading().run()).to.be.fulfilled;
    await test.validate('!isLoading');
    await expect(test.notLoading().run()).to.be.fulfilled;
  });

  it('continues when multiple conditions pass', async () => {
    await test.validate('isLoading');
    await expect(test.remainsMultiple().run()).to.be.fulfilled;
    await test.validate('!isLoading');
    await expect(test.remains(['!isLoading', () => true]).run()).to.be.fulfilled;
  });

  it('throws on non-computed properties', async () => {
    await expect(test.remains('click').run())
      .to.be.rejectedWith('`click` is not a computed property');
    await expect(test.remains('foo').run())
      .to.be.rejectedWith('`foo` is not a computed property');
  });

  it('throws when the condition fails', async () => {
    clearTimeout(timeout);

    await expect(test.remains('isLoading').run())
      .to.be.rejectedWith('`isLoading` is false');

    test.$root.classList.add('is-loading');
    await expect(test.remains('!isLoading').run())
      .to.be.rejectedWith('`isLoading` is true');

    await expect(test.remains([() => false, '!isLoading']).run())
      .to.be.rejectedWith('Validation function returned false');
  });

  it('throws when the custom condition fails', async () => {
    clearTimeout(timeout);

    await expect(test.beenLoading().run())
      .to.be.rejectedWith('`isLoading` is false');

    test.$root.classList.add('is-loading');
    await expect(test.notLoading().run())
      .to.be.rejectedWith('`isLoading` is true');

    await expect(test.remainsCustomFail().run())
      .to.be.rejectedWith('Validation function returned false');
  });
});
