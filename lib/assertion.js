import Context from './context.js';

/**
 * @template {{ assert?: boolean, [key: string]: any }} [T = {}]
 * @typedef {(void | boolean | import('./context').ContextFunction<T>)} AssertSubject
 */

/**
 * @template {{ assert?: boolean, [key: string]: any }} [T = {}]
 * @typedef {(context: Context<T>) => AssertSubject<T>} AssertFunction
 */

/**
 * @typedef {(string | ((context: Context) => string))} AssertMessage
 */

/**
 * @template {(AssertSubject | AssertFunction)} [T = AssertSubject]
 * @typedef {{ assertion: T, failureMessage?: AssertMessage, negatedMessage?: AssertMessage }} AssertObject
 */

/**
 * @param {AssertSubject} assertion
 * @param {AssertMessage} [failureMessage]
 * @param {AssertMessage} [negatedMessage]
 * @returns {import('./context').ContextGenerator<{ assert?: boolean }>}
 */
export function* assert(assertion, failureMessage, negatedMessage) {
  let expected = yield ({ assert }) => assert?.expected;
  let error, pass;

  try {
    pass = yield assertion;
    if (pass === undefined) pass = true;
  } catch (e) {
    if (expected) error = e;
    pass = false;
  }

  if (!!pass !== expected) {
    throw (error ?? new Error((expected
      ? (yield failureMessage) || 'Assertion failed'
      : (yield negatedMessage) || 'Expected assertion to fail'
    ).replace('#{this}', yield c => `${c.selector}`)));
  }

  return true;
}

export class Assertion {
  static Symbol = Symbol('@@interactor|assertion');

  /**
   * @overload
   * @param {AssertObject} options
   */

  /**
   * @overload
   * @param {AssertSubject} assertion
   * @param {AssertMessage} [failureMessage]
   * @param {AssertMessage} [negatedMessage]
   */

  /**
   * @param {(AssertObject | AssertSubject)} assertion
   * @param {AssertMessage} [failureMessage]
   * @param {AssertMessage} [negatedMessage]
   */
  constructor(assertion, failureMessage, negatedMessage) {
    if (typeof assertion === 'object' &&
        Object.getPrototypeOf(assertion) === Object.prototype)
      ({ assertion, failureMessage, negatedMessage } = assertion);

    Object.defineProperty(this, Assertion.Symbol, {
      value: () => assert(assertion, failureMessage, negatedMessage),
      enumerable: false
    });

    Object.defineProperty(this, Context.Symbol, {
      value: { assert: { expected: true } },
      enumerable: false
    });
  }
}

export default Assertion;
