export interface Empty {
  readonly tag: "EmptyLyst";
  readonly length: 0;
}

export const empty: Empty = { tag: "EmptyLyst", length: 0 };

export type LystType<T> = ILyst<T>;

export interface ILyst<T> {
  readonly tag: "Lyst";
  readonly val: T;
  readonly next: LystType<T> | Empty;
  readonly length: number;
}

export type Lyst<T> = ILyst<T> | Empty;

// test if li
export const isEmpty = <T>(xs: Lyst<T>) => xs.tag === "EmptyLyst";

export const Lyst = <T>(val: T, next: Lyst<T>): Lyst<T> => ({
  tag: "Lyst",
  val,
  next,
  length: next.length + 1
});

const flip = <T, U, V>(f: (x: T, y: U) => V) => (y2: U, x2: T): V => f(x2, y2);

const Tsil = <T>(next: Lyst<T>, val: T): Lyst<T> => Lyst(val, next);

export const unsafeHead = <T>(xs: Lyst<T>): T | undefined =>
  xs.tag === "EmptyLyst" ? undefined : xs.val;

export const foldr = <T, U>(f: (el: T, acc: U) => U) => (acc: U) => (
  list: Lyst<T>
): U =>
  list.tag === "EmptyLyst"
    ? acc
    : f(
        list.val,
        list.next.tag === "EmptyLyst" ? acc : foldr(f)(acc)(list.next)
      );

export const map = <T, U>(f: (x: T) => U): ((xs: Lyst<T>) => Lyst<U>) =>
  foldr<T, Lyst<U>>((y, ys) => Lyst(f(y), ys))(empty);

const prepend = <T>(x: T, xs: T[]): T[] => [x].concat(xs);
export const toArray = <T>(list: Lyst<T>) => foldr<T, T[]>(prepend)([])(list);

export const filter = <T>(
  pred: (x: T) => boolean
): ((xs: Lyst<T>) => Lyst<T>) =>
  foldr<T, Lyst<T>>((y, ys) => (pred(y) ? Lyst(y, ys) : ys))(empty);

export const unsafeFind = <T>(pred: (x: T) => boolean) => (
  xs: Lyst<T>
): T | undefined => (isEmpty(xs) ? undefined : xs.next);

export const concat = <T>(xs: Lyst<T>) => (ys: Lyst<T>): Lyst<T> =>
  foldr<T, Lyst<T>>(Lyst)(ys)(xs);

export const flatMap = <T, U>(
  f: (x: T) => Lyst<U>
): ((xs: Lyst<T>) => Lyst<U>) =>
  foldr<T, Lyst<U>>((y, ys) => concat(f(y))(ys))(empty);

export const fromArray = <T>(xs: T[]): Lyst<T> =>
  xs.reduceRight((acc, x) => Lyst(x, acc), empty as Lyst<T>);

export const zipWith = <T, U, V>(f: (x: T, y: U) => V) => (xs: Lyst<T>) => (
  ys: Lyst<U>
): Lyst<V> =>
  xs.tag === "EmptyLyst" || ys.tag === "EmptyLyst"
    ? empty
    : Lyst(f(xs.val, ys.val), zipWith(f)(xs.next)(ys.next));

export const equals = <T>(xs: Lyst<T>) => (ys: Lyst<T>): boolean => {
  if (xs.tag === "EmptyLyst" && ys.tag === "EmptyLyst") return true;
  if (xs.tag === "EmptyLyst" || ys.tag === "EmptyLyst") return false;
  return xs.val === ys.val && equals(xs.next)(ys.next);
};
