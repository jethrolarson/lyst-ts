/**
 * Empty list type
 */
export type Empty = {
  readonly tag: "EmptyLyst";
  readonly length: 0;
};

/**
 * The empty list value. Use this rather than creating your own.
 */
export const empty: Empty = { tag: "EmptyLyst", length: 0 };

/**
 * Immutable List that has at least one value
 */
export interface NonEmptyList<T> {
  readonly tag: "Lyst";
  readonly val: T;
  readonly next: Lyst<T>;
  readonly length: number;
}

/**
 * The list type
 */
export type Lyst<T> = NonEmptyList<T> | Empty;

/**
 *  Test if a list is empty
 */
export const isEmpty = <T>(xs: Lyst<T>) => xs.tag === "EmptyLyst";

/**
 * Create a list from a value
 * @param val value to store in the node
 * @param next next node in list. To terminate the list pass `empty`
 * @returns constructed list
 */
export const Lyst = <T>(val: T, next: Lyst<T>): NonEmptyList<T> => ({
  tag: "Lyst",
  val,
  next,
  length: next.length + 1
});

export const LystOf = <T>(x: T) => Lyst(x, empty);

// Helper to flip arguments of a binary function.
const flip = <T, U, V>(f: (x: T, y: U) => V) => (y2: U, x2: T): V => f(x2, y2);

/**
 * extract the first value from a list
 * @param fallback value to use if list is empty
 * @param xs list to extract from
 * @returns extracted value or the fallback
 */
export const headOr = <T>(fallback: T) => (xs: Lyst<T>): T =>
  xs.tag === "EmptyLyst" ? fallback : xs.val;

/**
 * reduce a list from right to left. Similar to `Array.prototype.reduceRight`
 * @param f Reducing function to apply to the list
 * @param acc Initial value for the first application of the reducing function
 * @returns result of the reduction
 */
export const foldr = <T, U>(f: (acc: U, el: T) => U) => (acc: U) => (
  xs: Lyst<T>
): U => (xs.tag === "EmptyLyst" ? acc : f(foldr(f)(acc)(xs.next), xs.val));

/**
 * reduce a list from left to right. Similar to `Array.prototype.reduce`
 * @param f Reducing function to apply to the list
 * @param acc Initial value for the first application of the reducing function
 * @returns result of the reduction
 */
export const foldl = <T, U>(f: (acc: U, el: T) => U) => (acc: U) => (
  xs: Lyst<T>
): U => (xs.tag === "EmptyLyst" ? acc : foldl(f)(f(acc, xs.val))(xs.next));

/**
 * Apply a transform function to each item in list. Similar to `Array.prototype.map`
 * @param f mapping function
 * @param xs list to transform
 * @returns new list with mapped values
 */
export const map = <T, U>(f: (x: T) => U): ((xs: Lyst<T>) => Lyst<U>) =>
  foldr<T, Lyst<U>>((ys, y) => Lyst(f(y), ys))(empty);

const prependTo = <T>(xs: T[], x: T): T[] => [x].concat(xs);

/**
 * convert a list to an array
 * @param list to convert to an array.
 */
export const toArray = <T>(list: Lyst<T>) => foldr<T, T[]>(prependTo)([])(list);

/**
 * Drop values from an array that match a predicate
 * @param pred function that tests the values
 * @param xs list to filter
 * @returns new list with the filtered values
 */
export const filter = <T>(
  pred: (x: T) => boolean
): ((xs: Lyst<T>) => Lyst<T>) =>
  foldr<T, Lyst<T>>((ys, y) => (pred(y) ? Lyst(y, ys) : ys))(empty);

/**
 * Extract the first value from a list that matches a predicate
 * @param pred function to test the values
 * @param fallback value to use if the expected value is not found
 * @param xs list to search
 * @returns the found result or the fallback if none is found
 */
export const findOr = <T>(pred: (x: T) => boolean, fallback: T) => (
  xs: Lyst<T>
): T =>
  xs.tag === "EmptyLyst"
    ? fallback
    : pred(xs.val)
      ? xs.val
      : findOr(pred, fallback)(xs.next);

/**
 * concatenate two lists
 * @param xs left list
 * @param ys right list
 * @returns concatenated list
 */
export const concat = <T>(xs: Lyst<T>) => (ys: Lyst<T>): Lyst<T> =>
  foldr<T, Lyst<T>>(flip(Lyst))(ys)(xs);

// identity function
const id = <T>(x: T): T => x;

/**
 * Flatten a list of lists down a level.
 * @param xs list to unnest
 * @returns flattened list
 */
export const flatten = <T>(xs: Lyst<Lyst<T>>): Lyst<T> =>
  flatMap<Lyst<T>, T>(id)(xs);

/**
 * Apply a function that returns lists to each item in a list, flatening along the way.
 * @param f function that maps items in `xs` to another list
 * @param xs list to remap
 * @returns unnested list
 */
export const flatMap = <T, U>(
  f: (x: T) => Lyst<U>
): ((xs: Lyst<T>) => Lyst<U>) =>
  foldr<T, Lyst<U>>((ys, y) => concat(f(y))(ys))(empty);

/**
 * Convert an array to a list
 * @param xs array of values
 * @returns list of values
 */
export const fromArray = <T>(xs: T[]): Lyst<T> =>
  xs.reduceRight((acc, x) => Lyst(x, acc), <Lyst<T>>empty);

/**
 * join two lists into one using passed function. Will terminate when either list is empty.
 * @param f binary function to join the values
 * @param xs left list
 * @param ys right list
 * @returns new list with the zipped values
 */
export const zipWith = <T, U, V>(f: (x: T, y: U) => V) => (xs: Lyst<T>) => (
  ys: Lyst<U>
): Lyst<V> =>
  xs.tag === "EmptyLyst" || ys.tag === "EmptyLyst"
    ? empty
    : Lyst(f(xs.val, ys.val), zipWith(f)(xs.next)(ys.next));

/**
 * interleave two lists
 * @param xs list
 * @param ys other list
 * @returns interleaved list
 */
export const zip = <T>(xs: Lyst<T>) => (ys: Lyst<T>): Lyst<T> =>
  flatten(zipWith<T, T, Lyst<T>>((x, y) => Lyst(x, LystOf(y)))(xs)(ys));

/**
 * compare two lists
 * @param xs list
 * @param ys other list
 * @returns false if the the lists don't contain the same values in the same order
 */
export const equals = <T>(xs: Lyst<T>) => (ys: Lyst<T>): boolean => {
  if (xs.tag === "EmptyLyst" && ys.tag === "EmptyLyst") return true;
  if (xs.tag === "EmptyLyst" || ys.tag === "EmptyLyst") return false;
  return xs.val === ys.val && equals(xs.next)(ys.next);
};
