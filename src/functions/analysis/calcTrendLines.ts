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
    let rangeLow = { x: range, y: marketData[range].low };
    let rangeBodyHigh = { x: 0, y: 0 };
    let rangeBodyLow = {
      x: range,
      y:
        marketData[range].close < marketData[range].open
          ? marketData[range].close
          : marketData[range].open,
    };

    for (
      let i = range;
      i < range + rangeConstant && i < marketData.length;
      i++
    ) {
      const priceData = marketData[i];
      if (priceData.high > rangeHigh.y) {
        rangeHigh = { x: i, y: priceData.high };
      }

      if (priceData.low < rangeLow.y) {
        rangeLow = { x: i, y: priceData.low };
      }

      const bodyHigh =
        priceData.close > priceData.open ? priceData.close : priceData.open;
      const bodyLow =
        priceData.close < priceData.open ? priceData.open : priceData.close;

      if (bodyHigh > rangeBodyHigh.y) {
        rangeBodyHigh = { x: i, y: bodyHigh };
      }

      if (bodyLow < rangeBodyLow.y) {
        rangeBodyLow = { x: i, y: bodyLow };
      }
    }
    rangeHighsArray.push(rangeHigh);
    rangeLowsArray.push(rangeLow);
    rangeBodyHighsArray.push(rangeBodyHigh);
    rangeBodyLowsArray.push(rangeBodyLow);
  }
  console.log('RL', rangeLowsArray);
  return {
    highs: rangeHighsArray,
    lows: rangeLowsArray,
    bodyHighs: rangeBodyHighsArray,
    bodyLows: rangeBodyLowsArray,
  };
};

const findSupportLevels = (coords: any[]) => {
  // Smallest to largets
  const sortedCoords = coords.sort((first, second) => first.y - second.y);
  // const sortedCoords = coords.sort((first, second) => second.y - first.y);

  const supports = [];

  // Loop through the array...
  for (let i = 0; i < sortedCoords.length; i = 0) {
    const coordsFoundToBeClose = [sortedCoords[0]];
    let stillFindingCloseCoords = true;

    sortedCoords.splice(0, 1);

    while (stillFindingCloseCoords && sortedCoords.length > 0) {
      if (
        coordsFoundToBeClose[0].y + coordsFoundToBeClose[0].y * 0.013 >
        sortedCoords[0].y
      ) {
        // console.log('p');
        coordsFoundToBeClose.push(sortedCoords[0]);
        sortedCoords.splice(0, 1);
      } else {
        stillFindingCloseCoords = false;
      }
    }

    const sum = coordsFoundToBeClose.reduce((a, b) => a + b.y, 0);
    const median = sum / coordsFoundToBeClose.length;

    supports.push({ y: median, strength: coordsFoundToBeClose.length });
  }
  return supports;
};

export const calcTrendLines = (marketData: any[]) => {
  const { highs, lows, bodyHighs, bodyLows } = findMinMaxs(marketData, 10);
  const supports = findSupportLevels(lows);
  console.log('supports', supports);
  // console.log(highs);
  // console.log(lows);
  // console.log(bodyHighs);
  // console.log(bodyLows);
};
