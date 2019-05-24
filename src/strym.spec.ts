import {Strym} from './strym';

const log = (label: string) => (...args: any[]) => console.log(label, ...args);

describe('straem.ts', () => {
  describe('Strym:concat', () => {
    it('join two streams', () => {
      const s = Strym.empty<number>();
      const s2 = Strym.empty<number>();
      const s3 = s.concat(s2);
      const mock = jest.fn();
      s3.on(mock);
      s.trigger(1);
      s2.trigger(2);
      expect(mock.mock.calls).toEqual([[1], [2]]);
    });
  });

  describe('Strym:filter', () => {
    it('filters a stream', () => {
      const s = Strym.empty<number>();
      const s2 = s.filter((a: number) => a > 2);
      const mock = jest.fn();
      s2.on(mock);
      s.trigger(1);
      s.trigger(2);
      s.trigger(3);
      s.trigger(4);
      expect(mock.mock.calls).toEqual([[3], [4]]);
    });
    it('narrows a union', () => {
      const s = Strym.empty<number | string>();
      const s2 = s.filter<string>((a: string | number): a is string => typeof a === 'string');
      const mock = jest.fn();
      s2.on(mock);
      s.trigger(1);
      s.trigger('a');
      s.trigger(3);
      s.trigger('b');
      expect(mock.mock.calls).toEqual([['a'], ['b']]);
    });
  });

  describe('Strym:map', () => {
    it('returns a new stream mapped by mapping function', () => {
      const mock = jest.fn();
      const s = new Strym<number>();
      s.on(mock);
      s.trigger(1);
      const ss = s.map(x => x + 1);

      const mock2 = jest.fn();
      ss.on(mock2);
      s.trigger(2);
      ss.trigger(3); //doesn't apply mapping function
      s.trigger(6);
      expect(mock.mock.calls).toEqual([[1], [2], [6]]);
      expect(mock2.mock.calls).toEqual([[3], [3], [7]]);
    });
  });

  describe('Strym:scan', () => {
    it('does stuff', () => {
      const add = (a: number, b: number) => a + b;
      const s = new Strym<number>();
      const sum = s.scan(add, 0);
      const mock = jest.fn();
      sum.on(mock);
      s.trigger(1);
      s.trigger(3);
      expect(mock.mock.calls).toEqual([[1], [4]]);
    });
  });

  describe('Strym:ap', () => {
    it('applies functions from passed stream', () => {
      const s = new Strym<number>();
      const fs = new Strym<(x: number) => boolean>();
      const ss = s.ap(fs);
      const mock = jest.fn();
      ss.on(mock);
      fs.trigger((x: number) => x > 1);
      s.trigger(1);
      s.trigger(2);
      expect(mock.mock.calls).toEqual([[false], [true]]);
    });
  });

  describe('Strym.flatten', () => {
    it('flattens a stream of streams', () => {
      const s = new Strym<Strym<number>>();
      const mock = jest.fn();
      const flat = Strym.flatten(s);
      flat.on(mock);
      const ss = new Strym<number>();
      const sss = new Strym<number>();
      s.trigger(ss);
      s.trigger(sss);
      ss.trigger(2);
      sss.trigger(3);
      expect(mock.mock.calls).toEqual([[2], [3]]);
    });
  });
});
