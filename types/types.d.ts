// Minimum TypeScript Version: 3.9

// why does this need to be polyfilled?
type Parameters<T extends (...args: any[]) => any> =
  T extends (...args: infer P) => any ? P : never;

declare type InteractorSelector = string | Interactor
  | ((element: HTMLElement, multiple?: boolean) => HTMLElement);

declare type InteractorAssertion = (expected: boolean, ...args: any[]) => void;

declare namespace InteractorDescriptor {
  type Assert = { assert: InteractorAssertion };
  type ChildGetter = { child: Interactor } & Partial<Assert>;
  type ChildMethod = { child: (...args: any[]) => Interactor } & Partial<Assert>;
  type NestedGetter = { get: () => Interactor } & Partial<Assert>;
  type NestedMethod = { value: (...args: any[]) => Interactor } & Partial<Assert>;
  type ValueGetter = { get: () => any } & Partial<Assert>;
  type ValueMethod = { value: (...args: any[]) => any } & Partial<Assert>;
}

type ExtendOptions = Partial<{
  interactor: Partial<{
    selector: string | ((selector?: any) => InteractorSelector),
    timeout: number
  }>,

  assert: {
    [k: string]: InteractorAssertion
  }
} & {
  readonly [k: string]: Interactor | any
} & {
  [k: string]: (
    ((...args: any[]) => any)
      | Interactor
      | InteractorConstructor
      | InteractorDescriptor.Assert
      | InteractorDescriptor.ChildGetter
      | InteractorDescriptor.ChildMethod
      | InteractorDescriptor.NestedGetter
      | InteractorDescriptor.NestedMethod
      | InteractorDescriptor.ValueGetter
      | InteractorDescriptor.ValueMethod
  )
}>;

interface Interactor {
  timeout(): number;
  timeout(ms: number): this;
  assert: InteractorAssert<this>;
  exec(callback: (this: this, element: HTMLElement) => void | Promise<void>): this;
  catch(callback: (this: this, error: Error) => void | Promise<void>): this;
  then: Promise<void>["then"];
  toString(): string;
}

interface InteractorConstructor<I extends Interactor = Interactor> {
  (selector?: InteractorSelector): I;
  new (selector?: InteractorSelector): I;

  <O extends ExtendOptions>(
    selector?: InteractorSelector,
    options?: O
  ): ExtendedInteractor<I, O>;

  new <O extends ExtendOptions>(
    selector?: InteractorSelector,
    options?: O
  ): ExtendedInteractor<I, O>;

  extend<O extends ExtendOptions>(
    options?: O & ThisType<ExtendedInteractor<I, O>>
  ): InteractorConstructor<ExtendedInteractor<I, O>>;
}

type ExtendedInteractor<I extends Interactor, O extends ExtendOptions> = {
  assert: InteractorAssert<ExtendedInteractor<I, O>, O>;
} & {
  readonly [K in keyof O]: (
    O[K] extends (...args: any[]) => Interactor ? ChildInteractorMethod<ExtendedInteractor<I, O>, O[K]>
      : O[K] extends (...args: any[]) => any ? O[K]
      : O[K] extends Interactor ? ChildInteractor<ExtendedInteractor<I, O>, O[K]>
      : O[K] extends InteractorConstructor ? ChildInteractorMethod<ExtendedInteractor<I, O>, O[K]>
      : O[K] extends InteractorDescriptor.ChildGetter ? ChildInteractor<ExtendedInteractor<I, O>, O[K]["child"]>
      : O[K] extends InteractorDescriptor.ChildMethod ? ChildInteractorMethod<ExtendedInteractor<I, O>, O[K]["child"]>
      : O[K] extends InteractorDescriptor.NestedGetter ? ChildInteractor<ExtendedInteractor<I, O>, ReturnType<O[K]["get"]>>
      : O[K] extends InteractorDescriptor.NestedMethod ? ChildInteractorMethod<ExtendedInteractor<I, O>, O[K]["value"]>
      : O[K] extends InteractorDescriptor.ValueGetter ? ReturnType<O[K]["get"]>
      : O[K] extends InteractorDescriptor.ValueMethod ? O[K]["value"]
      : O[K]
  )
} & I;

type ChildInteractor<P extends Interactor, C extends Interactor> = {
  readonly [K in keyof C]: (
    C[K] extends Interactor ? ChildInteractor<P, C[K]>
      : C[K] extends (...args: any[]) => C ? (...args: Parameters<C[K]>) => P
      : C[K] extends (...args: any[]) => Interactor ? ChildInteractorMethod<P, C[K]>
      : C[K]
  )
} & C;

type ChildInteractorMethod<P extends Interactor, C extends (...args: any[]) => Interactor> =
  (...args: Parameters<C>) => ChildInteractor<P, ReturnType<C>>;

type ExtendedInteractorOptions<I extends Interactor> =
  I extends ExtendedInteractor<Interactor, infer O> ? O : {};

type InteractorAssert<I extends Interactor, O extends ExtendOptions = ExtendedInteractorOptions<I>> = {
  (assertion: (this: I, element: HTMLElement) => void): I;
} & {
  readonly [A in keyof O["assert"]]: InteractorAssertMethod<I, O["assert"][A]>
} & {
  readonly [K in keyof O]: (
    O[K] extends (...args: any[]) => any ? undefined
      : O[K] extends Interactor ? InteractorAssert<ChildInteractor<I, O[K]>>
      : O[K] extends InteractorConstructor ? InteractorChildAssert<I, O[K]>
      : O[K] extends InteractorDescriptor.Assert ? InteractorAssertMethod<I, O[K]["assert"]>
      : O[K] extends InteractorDescriptor.ChildGetter ? InteractorAssert<ChildInteractor<I, O[K]["child"]>>
      : O[K] extends InteractorDescriptor.ChildMethod ? InteractorChildAssert<I, O[K]["child"]>
      : O[K] extends InteractorDescriptor.NestedGetter ? InteractorAssert<ChildInteractor<I, ReturnType<O[K]["get"]>>>
      : O[K] extends InteractorDescriptor.NestedMethod ? InteractorChildAssert<I, O[K]["value"]>
      : (...args: any[]) => I
  )
};

type InteractorChildAssert<P extends Interactor, A extends (...args: any[]) => Interactor> =
  (...args: Parameters<A>) => InteractorAssert<ChildInteractor<P, ReturnType<A>>>;

type InteractorAssertParameters<A extends (expected: boolean, ...args: any[]) => any> =
  A extends (expected: boolean, ...args: infer P) => any ? P : never;

type InteractorAssertMethod<I extends Interactor, A extends (...args: any[]) => any> =
  (...args: InteractorAssertParameters<A>) => I;

declare const Interactor: InteractorConstructor;

export default Interactor;
