// Calculates a cross for two different data point. Returns string 'positive' if
// point1 has crossed positive or 'negative if point1 data has crossed negative.
export const calcCross = (
  prevPoint1,
  prevPoint2,
  currentPoint1,
  currentPoint2
  // prev: any[],
  // current: any[],
  // point1Key: string,
  // point2Key: string
): any[] => {
  if (
    prevPoint1 === undefined ||
    prevPoint2 === undefined ||
    currentPoint1 === undefined ||
    currentPoint2 === undefined
  )
    return;

  if (
    Math.sign(prevPoint2 - prevPoint1) !==
    Math.sign(currentPoint2 - currentPoint1)
  ) {
    if (Math.sign(currentPoint2 - currentPoint1) === 1) {
      return "negative";
    } else {
      return "positive";
    }
  }
};
