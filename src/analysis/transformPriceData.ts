// Adds smoothened value to a market price data array by averaging a price in time by the
// neighbouring price points where number of neighbouring points used either side of a price
// is dictated by the 'smoothFactor'. A larger smoothFactor = more points used in averaging
// and so flatter returned price data.
//
// Key defines which value to use in the market price data and id (optional) is used for the
// key where the smoothened value is store in returning market data array.
export const calcSmoothArrayData = (
  marketPriceData: any[],
  smoothFactor: number,
  key: string,
  id?: string,
): any[] => {
  return marketPriceData.map((priceData, i) => {
    if (i < smoothFactor || i > marketPriceData.length - smoothFactor)
      return { ...priceData };
    let sum = 0;

    let loopedIndex;
    for (
      loopedIndex = i - smoothFactor;
      loopedIndex < i + smoothFactor;
      loopedIndex++
    ) {
      sum = sum + marketPriceData[loopedIndex][key];
    }

    const smoothed = sum / (smoothFactor * 2);

    return { ...priceData, [id ? id : 'smooth']: smoothed };
  });
};
