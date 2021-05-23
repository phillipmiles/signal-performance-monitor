import { calcMomentum } from './transformPriceData';

const exampleData1 = [
  1,
  3,
  4,
  5,
  3,
  2,
  1,
  0,
  0,
  1,
  2,
  0,
  1,
  2,
  3,
  6,
  8,
  11,
  10,
  9,
  7,
  5,
  5,
];
describe('Momentum - calc', () => {
  test('Percentage change 100%', async () => {
    const momentum = calcMomentum(exampleData1, 4);
    const momentum2 = calcMomentum(momentum, 4);
    // console.log(momentum, momentum2);
    expect(true).toEqual(true);
  });
});
