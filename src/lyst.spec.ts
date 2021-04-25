/* env: node */
import {
  Lyst,
  empty,
  foldr,
  foldl,
  toArray,
  fromArray,
  filter,
  equals,
  zipWith,
  concat,
  map,
  flatMap,
  headOr,
  findOr,
  isEmpty,
  zip,
  range,
  show,
  LystOf,
  join,
} from './lyst';

const add = (a: number, b: number) => a + b;

const strcat = (a: string, b: string) => a + b;

const sub = (a: number, b: number) => a - b;

const negate = (a: number) => -a;

const isEven = (a: number) => a % 2 === 0;

describe('L.ts', () => {
  describe('Lyst', () => {
    it('creates a nested data structure', () => {
      const l = Lyst(1, Lyst(2, Lyst(3, empty)));
      expect(l.length).toBe(3);
    });
  });

  describe('join', () => {
    it('turns a lyst into a string', () => {
      expect(join('$')(fromArray([1, 2, 3]))).toBe('1$2$3');
    });
    it('handles empty lyst', () => {
      expect(join('$')(empty)).toBe('');
    });
  });

  describe('show', () => {
    it('prints a list', () => {
      expect(show(Lyst(1, LystOf(2)))).toBe('Lyst[1, 2]');
    });
    it('prints empty lyst', () => {
      expect(show(empty)).toBe('Lyst[]');
    });
  });

  describe('range', () => {
    it('Creates list within range', () => {
      const l = range(2, 10, 2);
      expect(equals(l)(fromArray([2, 4, 6, 8]))).toBe(true);
    });
  });

  describe('isEmpty', () => {
    it('true for empty list', () => {
      expect(isEmpty(empty)).toBe(true);
    });
    it('false otherwise', () => {
      expect(isEmpty(Lyst(1, empty))).toBe(false);
    });
  });

  describe('foldr', () => {
    it('sums', () => {
      const l = Lyst('5', Lyst('4', Lyst('3', empty)));
      expect(foldr(strcat)('')(l)).toBe('345');
    });
  });

  describe('foldl', () => {
    it('sums', () => {
      const l = Lyst('5', Lyst('4', Lyst('3', empty)));
      expect(foldl(strcat)('')(l)).toBe('543');
    });
  });

  describe('toArray', () => {
    it('can convert to array', () => {
      const l = Lyst(1, Lyst(2, Lyst(3, empty)));
      expect(toArray(l)).toEqual([1, 2, 3]);
    });
  });

  describe('fromArray', () => {
    it('can convert array to list', () => {
      const ar = [1, 2, 3, 4];
      const l = fromArray(ar);
      expect(l.length).toBe(4);
    });
  });

  describe('equals', () => {
    it('can fail on empty lists', () => {
      const l = empty;
      const exp = Lyst(1, empty);
      expect(equals(l)(exp)).toBe(false);
    });
    it('can fail on lists of different length', () => {
      const l = fromArray([1, 2, 3, 4]);
      const exp = fromArray([1, 2]);
      expect(equals(l)(exp)).toBe(false);
    });
    it('can fail on lists of different values', () => {
      const l = fromArray([1, 2, 3, 4]);
      const exp = fromArray([1, 2, 3, 5]);
      expect(equals(l)(exp)).toBe(false);
    });

    it('passes on equal lists', () => {
      expect(equals(empty)(empty)).toBe(true);
      const l = fromArray([1, 2, 3, 4]);
      const exp = fromArray([1, 2, 3, 4]);
      expect(equals(l)(exp)).toBe(true);
    });
  });

  describe('filter', () => {
    it('can filter items', () => {
      const l = fromArray([1, 2, 3, 4]);
      const l2 = filter((a: number) => a > 2)(l);
      const exp = fromArray([3, 4]);
      expect(equals(l2)(exp)).toBe(true);
    });
  });

  describe('concat', () => {
    it('puts lists together', () => {
      const l = fromArray([1, 2]);
      const m = fromArray([3, 4]);
      const exp = fromArray([1, 2, 3, 4]);
      const l2 = concat(l)(m);
      expect(equals(l2)(exp)).toBe(true);
    });
  });

  describe('map', () => {
    it('transforms items', () => {
      const l = fromArray([1, 2, 3, 4]);
      const l2 = map(negate)(l);
      const exp = fromArray([-1, -2, -3, -4]);
      expect(equals(l2)(exp)).toBe(true);
    });
    it('converts types', () => {
      const l = fromArray([1, 2, 3, 4]);
      const l2 = map(String)(l);
      const exp = fromArray(['1', '2', '3', '4']);
      expect(equals(l2)(exp)).toBe(true);
    });
  });
  describe('flatMap', () => {
    it('transforms items', () => {
      const l = fromArray([[1], [2, 3], [4, 5, 6], []]);
      const l2 = flatMap((x: number[]) => fromArray(x))(l);
      const exp = fromArray([1, 2, 3, 4, 5, 6]);
      expect(equals(l2)(exp)).toBe(true);
    });
  });

  describe('headOr', () => {
    it('extracts first value', () => {
      const l = fromArray([1, 2, 3, 4]);
      expect(headOr(5)(l)).toBe(1);
    });
    it('uses fallback for empty list', () => {
      const l = empty;
      expect(headOr(5)(l)).toBe(5);
    });
  });

  describe('findOr', () => {
    it('extracts first matching value', () => {
      const l = fromArray([1, 2, 3, 4]);
      expect(findOr(isEven, <number>5)(l)).toBe(2);
    });
    it('uses fallback on empty list', () => {
      const l = empty;
      const fallback = 5;
      expect(findOr(isEven, fallback)(l)).toBe(fallback);
    });
    it('uses fallback when not found', () => {
      const l = fromArray([1, 3, 5, 7]);
      const fallback: number = 5;
      expect(findOr(isEven, fallback)(l)).toBe(fallback);
    });
  });

  describe('zipWith', () => {
    it('joins two arrays with binary function', () => {
      const l = fromArray([1, 2, 3, 4]);
      expect(equals(zipWith(add)(l)(l))(fromArray([2, 4, 6, 8]))).toBe(true);
    });
    it('ignores values of longer list', () => {
      const l = fromArray([1, 2, 3, 4]);
      const m = fromArray([1, 2, 3, 4, 5, 6]);
      expect(equals(zipWith(add)(l)(l))(fromArray([2, 4, 6, 8]))).toBe(true);
    });
    it('handles empty list', () => {
      const l = fromArray([1, 2, 3, 4]);
      const m = empty;
      expect(isEmpty(zipWith(add)(l)(m))).toBe(true);
    });
  });

  describe('zip', () => {
    it('joins two arrays with binary function', () => {
      const l = fromArray([1, 2, 3]);
      expect(equals(zip(l)(l))(fromArray([1, 1, 2, 2, 3, 3]))).toBe(true);
    });
  });
});
