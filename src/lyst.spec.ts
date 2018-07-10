import {
  Lyst,
  empty,
  foldr,
  toArray,
  fromArray,
  filter,
  equals,
  zipWith,
  concat,
  map,
  flatMap
} from "./lyst";

const add = (a: number, b: number) => a + b;

const negate = (a: number) => -a;

describe("L.ts", () => {
  describe("Lyst", () => {
    it("creates a nested data structure", () => {
      const l = Lyst(1, Lyst(2, Lyst(3, empty)));
      expect(l.length).toBe(3);
    });
  });

  describe("foldr", () => {
    it("sums", () => {
      const l = Lyst(1, Lyst(2, Lyst(3, empty)));
      expect(foldr(add)(0)(l)).toBe(6);
    });
  });

  describe("toArray", () => {
    it("can convert to array", () => {
      const l = Lyst(1, Lyst(2, Lyst(3, empty)));
      expect(toArray(l)).toEqual([1, 2, 3]);
    });
  });

  describe("fromArray", () => {
    it("can convert array to list", () => {
      const ar = [1, 2, 3, 4];
      const l = fromArray(ar);
      expect(l.length).toBe(4);
    });
  });

  describe("equals", () => {
    it("can fail on empty lists", () => {
      const l = empty;
      const exp = Lyst(1, empty);
      expect(equals(l)(exp)).toBe(false);
    });
    it("can fail on lists of different length", () => {
      const l = fromArray([1, 2, 3, 4]);
      const exp = fromArray([1, 2]);
      expect(equals(l)(exp)).toBe(false);
    });
    it("can fail on lists of different values", () => {
      const l = fromArray([1, 2, 3, 4]);
      const exp = fromArray([1, 2, 3, 5]);
      expect(equals(l)(exp)).toBe(false);
    });

    it("passes on equal lists", () => {
      expect(equals(empty)(empty)).toBe(true);
      const l = fromArray([1, 2, 3, 4]);
      const exp = fromArray([1, 2, 3, 4]);
      expect(equals(l)(exp)).toBe(true);
    });
  });

  describe("filter", () => {
    it("can filter items", () => {
      const l = fromArray([1, 2, 3, 4]);
      const l2 = filter(a => a > 2)(l);
      const exp = fromArray([3, 4]);
      expect(equals(l2)(exp)).toBe(true);
    });
  });

  describe("zipWith", () => {
    it("can filter items", () => {
      const l = fromArray([1, 2, 3, 4]);
      const exp = fromArray([1, 2, 3, 5]);
      expect(equals(zipWith(add)(l)(exp))(fromArray([2, 4, 6, 9]))).toBe(true);
    });
  });

  describe("concat", () => {
    it("puts lists together", () => {
      const l = fromArray([1, 2]);
      const m = fromArray([3, 4]);
      const exp = fromArray([1, 2, 3, 4]);
      const l2 = concat(l)(m);
      expect(equals(l2)(exp)).toBe(true);
    });
  });

  describe("map", () => {
    it("transforms items", () => {
      const l = fromArray([1, 2, 3, 4]);
      const l2 = map(negate)(l);
      const exp = fromArray([-1, -2, -3, -4]);
      expect(equals(l2)(exp)).toBe(true);
    });
    it("converts types", () => {
      const l = fromArray([1, 2, 3, 4]);
      const l2 = map(String)(l);
      const exp = fromArray(["1", "2", "3", "4"]);
      expect(equals(l2)(exp)).toBe(true);
    });
  });
  describe("flatMap", () => {
    it("transforms items", () => {
      const l = fromArray([[1], [2, 3], [4, 5, 6], []]);
      const l2 = flatMap((x: number[]) => fromArray(x))(l);
      const exp = fromArray([1, 2, 3, 4, 5, 6]);
      expect(equals(l2)(exp)).toBe(true);
    });
  });
});
