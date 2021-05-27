const findMinMaxs = (marketData, rangeConstant) => {
  const rangeHighsArray = [];
  const rangeLowsArray = [];
  const rangeBodyHighsArray = [];
  const rangeBodyLowsArray = [];
  for (
    let range = 0;
    range < marketData.length;
    range = range + rangeConstant
  ) {
    let rangeHigh = { x: 0, y: 0 };
    let rangeLow = { x: 0, y: 0 };
    let rangeBodyHigh = { x: 0, y: 0 };
    let rangeBodyLow = { x: 0, y: 0 };

    for (
      let i = range;
      i < range + rangeConstant && i < marketData.length;
      i++
    ) {
      const priceData = marketData[i];
      if (priceData.high > rangeHigh.y) {
        rangeHigh = { x: i, y: priceData.high };
      }

      if (priceData.low > rangeLow) {
        rangeLow = { x: i, y: priceData.low };
      }

      const bodyHigh =
        priceData.close > priceData.open ? priceData.close : priceData.open;
      const bodyLow =
        priceData.close > priceData.open ? priceData.open : priceData.close;

      if (bodyHigh > rangeBodyHigh.y) {
        rangeBodyHigh = { x: i, y: bodyHigh };
      }

      if (bodyLow > rangeBodyLow.y) {
        rangeBodyLow = { x: i, y: bodyLow };
      }
    }
    rangeHighsArray.push(rangeHigh);
    rangeLowsArray.push(rangeLow);
    rangeBodyHighsArray.push(rangeBodyHigh);
    rangeBodyLowsArray.push(rangeBodyLow);
  }
  return {
    highs: rangeHighsArray,
    lows: rangeLowsArray,
    bodyHighs: rangeBodyHighsArray,
    bodyLows: rangeBodyHighsArray,
  };
};

export const calcTrendLines = (marketData: any[]) => {
  const { highs, lows, bodyHighs, bodyLows } = findMinMaxs(marketData, 10);
  console.log(highs);
  console.log(lows);
  console.log(bodyHighs);
  console.log(bodyLows);
};
