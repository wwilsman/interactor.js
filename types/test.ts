import Interactor from './types';

const Test = Interactor.extend({
  assert: {
    test(expected, foo: string) {}
  },

  method(foo: string) {
    return this.exec(() => console.log(foo));
  }
});

Test().method('foo')
Test().assert.test('foo')

const TT = Test.extend({
  foo(bar: string) {
    return 'test';
  },

  child: Test()
});

TT().method('foo')
TT().assert.test('foo')
TT().assert.child.test('foo')
TT().child.assert.test('bar')
TT().child.method('foo').foo('bar')
TT().child.exec(() => {}).foo('foo')
