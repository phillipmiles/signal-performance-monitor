import { isVal1ClosestToVal2, isValBetween } from './math';

describe('isVal1ClosestToVal2', () => {
  test('1', async () => {
    const val = isVal1ClosestToVal2(0, -1, 2);
    expect(val).toBe(true);
  });
  test('Test2', async () => {
    const val = isVal1ClosestToVal2(0, 2, -1);
    expect(val).toBe(false);
  });
  test('Test5', async () => {
    const val = isVal1ClosestToVal2(0, 2, 3);
    expect(val).toBe(true);
  });
  test('Test6', async () => {
    const val = isVal1ClosestToVal2(7, 14, 17);
    expect(val).toBe(true);
  });
  test('Test7', async () => {
    const val = isVal1ClosestToVal2(7, 17, 14);
    expect(val).toBe(false);
  });
  test('Test8', async () => {
    const val = isVal1ClosestToVal2(7, -17, -14);
    expect(val).toBe(false);
  });
  test('Test3', async () => {
    const val = isVal1ClosestToVal2(0, 3, -3);
    expect(val).toBe(true);
  });
  test('Test4', async () => {
    const val = isVal1ClosestToVal2(0, -3, 3);
    expect(val).toBe(true);
  });
});

describe('isValBetween', () => {
  test('1', async () => {
    const val = isValBetween(0, -14.9699999999998, 11.579999999999472);
    expect(val).toBe(true);
  });
  test('2', async () => {
    const val = isValBetween(0, 11.579999999999472, -14.9699999999998);
    expect(val).toBe(true);
  });
  test('3', async () => {
    const val = isValBetween(0, -19.620000000000346, 13.41000000000031);
    expect(val).toBe(true);
  });
  test('4', async () => {
    const val = isValBetween(0, 13.41000000000031, -19.620000000000346);
    expect(val).toBe(true);
  });
});
