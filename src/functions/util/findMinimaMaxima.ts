import { calcMomentum } from '../metrics/transformPriceData';
import { isValBetween, isVal1ClosestToVal2 } from '../../util/math';

// Look for monentum2 to cross over 0 inidicating a maxima or miniam was found.
const didMomentumCross = (
  currentMomentum: number,
  prevMomentum: number,
): boolean => {
  return isValBetween(0, prevMomentum, currentMomentum);
};

export const findDataArrayMinimaMaxima = (
  dataArray: any[],
  momentum1Key: string,
  momentum2Key: string,
): Record<string, number[]> => {
  const minimaIndices: number[] = [];
  const maximaIndices: number[] = [];

  dataArray.forEach((data, i) => {
    if (
      !dataArray[i - 1] ||
      data[momentum1Key] === undefined ||
      data[momentum2Key] === undefined
    )
      return;
    const current = dataArray[i];
    const prev = dataArray[i - 1];

    // If momentum crossed a maxima or miniam was found.
    if (didMomentumCross(current[momentum2Key], prev[momentum2Key])) {
      let crossIndex;

      // Check current and previous momentum to see which was closer to the cross
      // over point.
      if (isVal1ClosestToVal2(0, current[momentum2Key], prev[momentum2Key])) {
        crossIndex = i;
      } else {
        crossIndex = i - 1;
      }

      // Check momentum1 to see if it is a maxima or minima that was found.
      if (current[momentum1Key] >= 0) {
        maximaIndices.push(crossIndex);
      } else {
        minimaIndices.push(crossIndex);
      }
    }
  });
  return { minima: minimaIndices, maxima: maximaIndices };
};

// Same as above but it handles creating the momentum graphs. This is the main way
// of doing this as momentum doesn't actually need to be put onto array data. I think.
export const findLocalMinimaMaxima = (array, period) => {
  const momentum1 = calcMomentum(array, period);
  const momentum2 = calcMomentum(momentum1, period);
};
