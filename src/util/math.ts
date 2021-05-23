export const isValBetween = (
  val: number,
  val2: number,
  val3: number,
): boolean => {
  if ((val2 > val && val > val3) || (val3 > val && val > val2)) {
    // if ((val > val2 && val <= val3) || (val > val2 && val <= val3)) {
    return true;
  }
  return false;
};

// Observe the midway point between the current and previous value to see
// if the cross over 0 occured closer to current index or previous index.
export const isVal1ClosestToVal2 = (
  val1: number,
  val2: number,
  val3: number,
): boolean => {
  const normaliseVal2 = Math.abs(val2 - val1);
  const normaliseVal3 = Math.abs(val3 - val1);
  if (normaliseVal2 <= normaliseVal3) {
    return true;
  }
  return false;
};
