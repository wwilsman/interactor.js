/* global describe, beforeEach, afterEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, validate, hasClass } from '../../src';

@interactor class ValidateInteractor {
  isLoading = hasClass('is-loading');
  whenLoading = validate('isLoading');
  doneLoading = validate('!isLoading');
  validateCustom = validate(() => true);
  validateCustomFail = validate(() => false);
  validateMultiple = validate([
    'isLoading',
    () => true
  ]);
}

describe('BigTest Interaction: validate', () => {
  let timeout, test;

  useFixture('click-fixture');

  beforeEach(() => {
    let $btn = document.querySelector('.test-btn');

    timeout = setTimeout(() => {
      $btn.classList.add('is-loading');

      timeout = setTimeout(() => {
        $btn.classList.remove('is-loading');
      }, 50);
    }, 50);

    test = new ValidateInteractor({
      scope: '.test-btn',
      timeout: 100
    });
  });

  afterEach(() => {
    clearTimeout(timeout);
  });

  it('has validate methods', () => {
    expect(test).to.respondTo('validate');
    expect(test).to.respondTo('whenLoading');
    expect(test).to.respondTo('doneLoading');
    expect(test).to.respondTo('validateCustom');
    expect(test).to.respondTo('validateCustomFail');
    expect(test).to.respondTo('validateMultiple');
  });

  it('returns a new instance', () => {
    expect(test.validate('isLoading')).to.not.equal(test);
    expect(test.validate('isLoading')).to.be.an.instanceof(ValidateInteractor);
    expect(test.whenLoading()).to.not.equal(test);
    expect(test.whenLoading()).to.be.an.instanceof(ValidateInteractor);
    expect(test.validate('!isLoading')).to.not.equal(test);
    expect(test.validate('!isLoading')).to.be.an.instanceof(ValidateInteractor);
    expect(test.doneLoading()).to.not.equal(test);
    expect(test.doneLoading()).to.be.an.instanceof(ValidateInteractor);
    expect(test.validate(() => true)).to.not.equal(test);
    expect(test.validate(() => true)).to.be.an.instanceof(ValidateInteractor);
    expect(test.validateCustom()).to.not.equal(test);
    expect(test.validateCustom()).to.be.an.instanceof(ValidateInteractor);
    expect(test.validate(['isLoading', () => true])).to.not.equal(test);
    expect(test.validate(['isLoading', () => true])).to.be.an.instanceof(ValidateInteractor);
    expect(test.validateMultiple()).to.not.equal(test);
    expect(test.validateMultiple()).to.be.an.instanceof(ValidateInteractor);
  });

  it('continues when the condition passes', async () => {
    expect(test.isLoading).to.be.false;
    await expect(test.validate('isLoading').run()).to.be.fulfilled;
    expect(test.isLoading).to.be.true;
    await expect(test.validate('!isLoading').run()).to.be.fulfilled;
    expect(test.isLoading).to.be.false;
  });

  it('continues when the custom condition passes', async () => {
    expect(test.isLoading).to.be.false;
    await expect(test.whenLoading().run()).to.be.fulfilled;
    expect(test.isLoading).to.be.true;
    await expect(test.doneLoading().run()).to.be.fulfilled;
    expect(test.isLoading).to.be.false;
  });

  it('continues when multiple conditions pass', async () => {
    expect(test.isLoading).to.be.false;
    await expect(test.validateMultiple().run()).to.be.fulfilled;
    expect(test.isLoading).to.be.true;
    await expect(test.validate(['!isLoading', () => true]).run()).to.be.fulfilled;
    expect(test.isLoading).to.be.false;
  });

  it('throws on non-computed properties', async () => {
    await expect(test.validate('click').run())
      .to.be.rejectedWith('`click` is not a computed property');
    await expect(test.validate('foo').run())
      .to.be.rejectedWith('`foo` is not a computed property');
  });

  it('throws when the condition fails', async () => {
    clearTimeout(timeout);

    await expect(test.validate('isLoading').run())
      .to.be.rejectedWith('`isLoading` is false');

    test.$root.classList.add('is-loading');
    await expect(test.validate('!isLoading').run())
      .to.be.rejectedWith('`isLoading` is true');

    await expect(test.validate([() => false, '!isLoading']).run())
      .to.be.rejectedWith('Validation function returned false');
  });

  it('throws when the custom condition fails', async () => {
    clearTimeout(timeout);

    await expect(test.whenLoading().run())
      .to.be.rejectedWith('`isLoading` is false');

    test.$root.classList.add('is-loading');
    await expect(test.doneLoading().run())
      .to.be.rejectedWith('`isLoading` is true');

    await expect(test.validateCustomFail().run())
      .to.be.rejectedWith('Validation function returned false');
  });
});
