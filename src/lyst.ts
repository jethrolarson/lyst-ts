// # lyst.ts
// Type-safe immutable list for Typescript and JavaScript

// ## Exported Types
// ### EmptyLyst
// Lyst with no values
export type EmptyLyst = {
  readonly kind: 'EmptyLyst';
  readonly length: 0;
};

// ### NonEmptyLyst
// Lyst that has at least one value.
export type NonEmptyLyst<T> = {
  readonly kind: 'Lyst';
  readonly val: T;
  readonly next: Lyst<T>;
  readonly length: number;
};

// ### Lyst
// The real Lyst type
export type Lyst<T> = NonEmptyLyst<T> | EmptyLyst;

// ## Creating

// ### Lyst
// Create a lyst from a value
// * `val` - value to store in the node
// * `next` -  - next node in lyst. To terminate the lyst pass `empty`
export const Lyst = <T>(val: T, next: Lyst<T>): NonEmptyLyst<T> => ({
  kind: 'Lyst',
  val,
  next,
  length: next.length + 1,
});

// ### empty
// The empty lyst value. Since Lysts are immutable you never have to create a new empty lyst.
// Use this rather than creating your own.
export const empty: EmptyLyst = {kind: 'EmptyLyst', length: 0};

// ### range
// Create a list with values between a range
// * `start` - first number in range
// * `end` - where to end the range (exculsive)
// * `step` - how much to increment by on each step
export const range = (start: number, end: number, step: number): Lyst<number> =>
  start >= end ? empty : Lyst(start, range(start + step, end, step));

// ## Functions

// ### join
// Convert Lyst to string using a separator string
// * `separator` - string to put between elements
// * `xs` - lyst to join
export const join = (separator: string) => <T>(xs: Lyst<T>) => {
  switch (xs.kind) {
    case 'EmptyLyst':
      return '';
    case 'Lyst':
      return foldl<T, string>((str, x) => str + separator + String(x))(String(xs.val))(xs.next);
  }
};

// ### show
// Pretty-print a list
export const show = <T>(xs: Lyst<T>) => {
  switch (xs.kind) {
    case 'EmptyLyst':
      return 'Lyst[]';
    case 'Lyst':
      return `Lyst[${join(', ')(xs)}]`;
  }
};

// ### isEmpty
// Test if a lyst is empty. All lysts contain the empty lyst as the last element.
// * `xs` - lyst to check
export const isEmpty = <T>(xs: Lyst<T>) => xs === empty;

// ### LystOf
// Create a lyst with a single value
export const LystOf = <T>(x: T) => Lyst(x, empty);

// Internal helper to flip arguments of a binary function.
const flip = <T, U, V>(f: (x: T, y: U) => V) => (y2: U, x2: T): V => f(x2, y2);

// ### headOr
// extract the first value from a lyst
// * `fallback` - value to use if lyst is empty
// * `xs` - lyst to extract from
// * Returns extracted value or the fallback
//
// Example:
//
//     headOr(1, LystOf(2)) // --> 2
//     headOr(1, empty) // --> 1
export const headOr = <T>(fallback: T) => (xs: Lyst<T>): T => (xs.kind === 'EmptyLyst' ? fallback : xs.val);

// ### foldr
// Reduce a lyst from right to left. Similar to `Array.prototype.reduceRight`.
// * `f` - Reducing function to apply to the lyst
// * `acc` - Initial value for the first application of the reducing function
// * Returns result of the reduction
export const foldr = <T, U>(f: (acc: U, el: T) => U) => (acc: U) => (xs: Lyst<T>): U =>
  xs.kind === 'EmptyLyst' ? acc : f(foldr(f)(acc)(xs.next), xs.val);

// ### foldl
// Reduce a lyst from left to right. Similar to `Array.prototype.reduce`
// * `f` - Reducing function to apply to the lyst
// * `acc` - Initial value for the first application of the reducing function
// * Returns result of the reduction
export const foldl = <T, U>(f: (acc: U, el: T) => U) => (acc: U) => (xs: Lyst<T>): U =>
  xs.kind === 'EmptyLyst' ? acc : foldl(f)(f(acc, xs.val))(xs.next);

// ## map
// Apply a transform function to each item in lyst. Similar to `Array.prototype.map`
// * `f` - mapping function
// * `xs` - lyst to transform
// * Returns new lyst with mapped values
export const map = <T, U>(f: (x: T) => U): ((xs: Lyst<T>) => Lyst<U>) =>
  foldr<T, Lyst<U>>((ys, y) => Lyst(f(y), ys))(empty);

const prependTo = <T>(xs: T[], x: T): T[] => [x].concat(xs);

// ## toArray
// convert a lyst to an array
// * `lyst` - to convert to an array.
export const toArray = <T>(lyst: Lyst<T>) => foldr<T, T[]>(prependTo)([])(lyst);

// ## filter
// Drop values from an array that match a predicate
// * `pred` - function that tests the values
// * `xs` - lyst to filter
// * Returns new lyst with the filtered values
export const filter = <T>(pred: (x: T) => boolean): ((xs: Lyst<T>) => Lyst<T>) =>
  foldr<T, Lyst<T>>((ys, y) => (pred(y) ? Lyst(y, ys) : ys))(empty);

// ## findOr
// Extract the first value from a lyst that matches a predicate
// * `pred` - function to test the values
// * `fallback` - value to use if the expected value is not found
// * `xs` - lyst to search
// * Returns the found result or the fallback if none is found
export const findOr = <T>(pred: (x: T) => boolean, fallback: T) => (xs: Lyst<T>): T =>
  xs.kind === 'EmptyLyst' ? fallback : pred(xs.val) ? xs.val : findOr(pred, fallback)(xs.next);

// ## concat
// Concatenate two lysts
// * `xs` - left lyst
// * `ys` - right lyst
// * Returns concatenated lyst
export const concat = <T>(xs: Lyst<T>) => (ys: Lyst<T>): Lyst<T> => foldr<T, Lyst<T>>(flip(Lyst))(ys)(xs);

const id = <T>(x: T): T => x;

// ## flatten
// Flatten a lyst of lysts down a level.
// * `xs` - lyst to unnest
// * Returns flattened lyst
export const flatten = <T>(xs: Lyst<Lyst<T>>): Lyst<T> => flatMap<Lyst<T>, T>(id)(xs);

// ## flatMap
// Apply a function that returns lysts to each item in a lyst, flatening along the way.
// * `f` - function that maps items in `xs` to another lyst
// * `xs` - lyst to remap
// * Returns unnested lyst
export const flatMap = <T, U>(f: (x: T) => Lyst<U>): ((xs: Lyst<T>) => Lyst<U>) =>
  foldr<T, Lyst<U>>((ys, y) => concat(f(y))(ys))(empty);

// ## fromArray
// Convert an array to a lyst
// * `xs` - array of values
// * Returns lyst of values
export const fromArray = <T>(xs: T[]): Lyst<T> => xs.reduceRight((acc, x) => Lyst(x, acc), <Lyst<T>>empty);

// ## zipWith
// Join two lysts into one using passed function. Will terminate when either lyst is empty.
// * `f` - binary function to join the values
// * `xs` - left lyst
// * `ys` - right lyst
// * Returns new lyst with the zipped values
export const zipWith = <T, U, V>(f: (x: T, y: U) => V) => (xs: Lyst<T>) => (ys: Lyst<U>): Lyst<V> =>
  xs.kind === 'EmptyLyst' || ys.kind === 'EmptyLyst' ? empty : Lyst(f(xs.val, ys.val), zipWith(f)(xs.next)(ys.next));

// ## zip
// Interleave two lysts
// * `xs` - first lyst
// * `ys` - other lyst
// * Returns interleaved lyst
//
// Example:
//
//     zip(fromArray([1, 2, 3]))(fromArray([9, 8, 7])) //--> Lyst [1, 9, 2, 8, 3, 7]
export const zip = <T>(xs: Lyst<T>) => (ys: Lyst<T>): Lyst<T> =>
  flatten(zipWith<T, T, Lyst<T>>((x, y) => Lyst(x, LystOf(y)))(xs)(ys));

// ## equals
// Compare two lysts
// * `xs` - lyst
// * `ys` - other lyst
// * Returns false if the the lysts don't contain the same values in the same order
export const equals = <T>(xs: Lyst<T>) => (ys: Lyst<T>): boolean => {
  if (xs.kind === 'EmptyLyst' && ys.kind === 'EmptyLyst') return true;
  if (xs.kind === 'EmptyLyst' || ys.kind === 'EmptyLyst') return false;
  return xs.val === ys.val && equals(xs.next)(ys.next);
};
