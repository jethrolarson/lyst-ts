// # lyst.ts
// Type-safe Immutable list for Typescript and JavaScript

// ## Exported Types
// ### EmptyLyst
// Lyst with no values
export type EmptyLyst = {
  readonly tag: "EmptyLyst";
  readonly length: 0;
};

// ### NonEmptyLyst
// Lyst that has at least one value.
export type NonEmptyLyst<T> = {
  readonly tag: "Lyst";
  readonly val: T;
  readonly next: Lyst<T>;
  readonly length: number;
};

// ### Lyst
// The real Lyst type
export type Lyst<T> = NonEmptyLyst<T> | EmptyLyst;

// ## Creating

// ### Lyst
// Create a list from a value
// * `val` - value to store in the node
// * `next`  - next node in list. To terminate the list pass `empty`
export const Lyst = <T>(val: T, next: Lyst<T>): NonEmptyLyst<T> => ({
  tag: "Lyst",
  val,
  next,
  length: next.length + 1
});

// ### empty
// The empty list value. Since Lysts are immutable you never have to create a new empty list.
// Use this rather than creating your own.
export const empty: EmptyLyst = { tag: "EmptyLyst", length: 0 };

// ## Functions

// ### isEmpty
// Test if a list is empty. All lists contain the empty list as the last element.
export const isEmpty = <T>(xs: Lyst<T>) => xs === empty;

// ### LystOf
// Create a list with a single value
export const LystOf = <T>(x: T) => Lyst(x, empty);

// Internal helper to flip arguments of a binary function.
const flip = <T, U, V>(f: (x: T, y: U) => V) => (y2: U, x2: T): V => f(x2, y2);

// ### headOr
// extract the first value from a list
// * `fallback` - value to use if list is empty
// * `xs` - list to extract from
// * returns extracted value or the fallback
//
// Example:
//
//     headOr(1, LystOf(2)) // --> 2
//     headOr(1, empty) // --> 1
export const headOr = <T>(fallback: T) => (xs: Lyst<T>): T =>
  xs.tag === "EmptyLyst" ? fallback : xs.val;

// ### foldr
// Reduce a list from right to left. Similar to `Array.prototype.reduceRight`.
// * `f` Reducing function to apply to the list
// * `acc` Initial value for the first application of the reducing function
// * returns result of the reduction
export const foldr = <T, U>(f: (acc: U, el: T) => U) => (acc: U) => (
  xs: Lyst<T>
): U => (xs.tag === "EmptyLyst" ? acc : f(foldr(f)(acc)(xs.next), xs.val));

// ### foldl
// reduce a list from left to right. Similar to `Array.prototype.reduce`
// * `f` Reducing function to apply to the list
// * `acc` Initial value for the first application of the reducing function
// * returns result of the reduction
export const foldl = <T, U>(f: (acc: U, el: T) => U) => (acc: U) => (
  xs: Lyst<T>
): U => (xs.tag === "EmptyLyst" ? acc : foldl(f)(f(acc, xs.val))(xs.next));

// ## map
// Apply a transform function to each item in list. Similar to `Array.prototype.map`
// * `f` mapping function
// * `xs` list to transform
// * returns new list with mapped values
export const map = <T, U>(f: (x: T) => U): ((xs: Lyst<T>) => Lyst<U>) =>
  foldr<T, Lyst<U>>((ys, y) => Lyst(f(y), ys))(empty);

const prependTo = <T>(xs: T[], x: T): T[] => [x].concat(xs);

// ## toArray
// convert a list to an array
// * `list` to convert to an array.
export const toArray = <T>(list: Lyst<T>) => foldr<T, T[]>(prependTo)([])(list);

// ## filter
// Drop values from an array that match a predicate
// * `pred` function that tests the values
// * `xs` list to filter
// * returns new list with the filtered values
export const filter = <T>(
  pred: (x: T) => boolean
): ((xs: Lyst<T>) => Lyst<T>) =>
  foldr<T, Lyst<T>>((ys, y) => (pred(y) ? Lyst(y, ys) : ys))(empty);

// ## findOr
// Extract the first value from a list that matches a predicate
// * `pred` function to test the values
// * `fallback` value to use if the expected value is not found
// * `xs` list to search
// * returns the found result or the fallback if none is found
export const findOr = <T>(pred: (x: T) => boolean, fallback: T) => (
  xs: Lyst<T>
): T =>
  xs.tag === "EmptyLyst"
    ? fallback
    : pred(xs.val)
      ? xs.val
      : findOr(pred, fallback)(xs.next);

// ## concat
// concatenate two lists
// * `xs` left list
// * `ys` right list
// * returns concatenated list
export const concat = <T>(xs: Lyst<T>) => (ys: Lyst<T>): Lyst<T> =>
  foldr<T, Lyst<T>>(flip(Lyst))(ys)(xs);

const id = <T>(x: T): T => x;

// ## flatten
// Flatten a list of lists down a level.
// * `xs` list to unnest
// * returns flattened list
export const flatten = <T>(xs: Lyst<Lyst<T>>): Lyst<T> =>
  flatMap<Lyst<T>, T>(id)(xs);

// ## flatMap
// Apply a function that returns lists to each item in a list, flatening along the way.
// * `f` function that maps items in `xs` to another list
// * `xs` list to remap
// * returns unnested list
export const flatMap = <T, U>(
  f: (x: T) => Lyst<U>
): ((xs: Lyst<T>) => Lyst<U>) =>
  foldr<T, Lyst<U>>((ys, y) => concat(f(y))(ys))(empty);

// ## fromArray
// Convert an array to a list
// * `xs` array of values
// * returns list of values
export const fromArray = <T>(xs: T[]): Lyst<T> =>
  xs.reduceRight((acc, x) => Lyst(x, acc), <Lyst<T>>empty);

// ## zipWith
// join two lists into one using passed function. Will terminate when either list is empty.
// * `f` binary function to join the values
// * `xs` left list
// * `ys` right list
// * returns new list with the zipped values
export const zipWith = <T, U, V>(f: (x: T, y: U) => V) => (xs: Lyst<T>) => (
  ys: Lyst<U>
): Lyst<V> =>
  xs.tag === "EmptyLyst" || ys.tag === "EmptyLyst"
    ? empty
    : Lyst(f(xs.val, ys.val), zipWith(f)(xs.next)(ys.next));

// ## zip
// interleave two lists
// * `xs` list
// * `ys` other list
// * returns interleaved list
export const zip = <T>(xs: Lyst<T>) => (ys: Lyst<T>): Lyst<T> =>
  flatten(zipWith<T, T, Lyst<T>>((x, y) => Lyst(x, LystOf(y)))(xs)(ys));

// ## equals
// compare two lists
// * `xs` list
// * `ys` other list
// * returns false if the the lists don't contain the same values in the same order
export const equals = <T>(xs: Lyst<T>) => (ys: Lyst<T>): boolean => {
  if (xs.tag === "EmptyLyst" && ys.tag === "EmptyLyst") return true;
  if (xs.tag === "EmptyLyst" || ys.tag === "EmptyLyst") return false;
  return xs.val === ys.val && equals(xs.next)(ys.next);
};
