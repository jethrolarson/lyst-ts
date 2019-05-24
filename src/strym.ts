export const compose = <A, B, C>(f: (b: B) => C, g: (a: A) => B) => (x: A): C => f(g(x));
type Pred<T> = (x: T) => boolean;
type TypePred<T, U extends T> = (x: T) => x is U;

/**
 * Functor, Apply, Monoid, Foldable
 * Not Monad, Applicative
 */
export class Strym<T> {
  private listeners: Array<(n: T) => void> = [];

  // make something happen
  trigger = (a: T): void => {
    this.listeners.forEach(l => l(a));
  };

  // listen to changes
  on(f: (x: T) => void): void {
    this.listeners.push(f);
  }

  // identity for Monoid
  static empty = <U>() => new Strym<U>();

  // Satisfy Semigroup
  concat(stream: Strym<T>) {
    const s = new Strym();
    this.on(s.trigger);
    stream.on(s.trigger);
    return s;
  }

  // Satisfies Functor
  map<U>(f: (x: T) => U): Strym<U> {
    const s = new Strym<U>();
    this.listeners.push(
      compose(
        s.trigger,
        f,
      ),
    );
    return s;
  }

  // Satisfies Filterable
  filter<U extends T>(pred: T extends U ? Pred<T> : TypePred<T, U>): Strym<U> {
    const s = new Strym<U>();
    this.on(x => pred(x) && s.trigger(x));
    return s;
  }

  // like reduce but every item includes the result of the reduction
  scan<U>(f: (acc: U, item: T) => U, acc: U): Strym<U> {
    let lastVal = acc;
    return this.map(item => {
      lastVal = f(lastVal, item);
      return lastVal;
    });
  }

  // Satisfies Apply (part of Applicative)
  ap<U>(mf: Strym<(x: T) => U>): Strym<U> {
    const s = new Strym<U>();
    mf.on(f => this.on(x => s.trigger(f(x))));
    return s;
  }

  static flatten = <U>(stream: Strym<Strym<U>>): Strym<U> => {
    const s = new Strym<U>();
    stream.on(ss => ss.on(s.trigger));
    return s;
  };
}
