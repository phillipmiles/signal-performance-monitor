import { calcDataArraySmooth } from '../metrics/transformPriceData';

const findMinMaxs = (marketData, rangeConstant) => {
  const rangeHighsArray = [];
  const rangeLowsArray = [];
  const rangeBodyHighsArray = [];
  const rangeBodyLowsArray = [];
  for (
    let range = 0;
    range < marketData.length - rangeConstant; // Run array to rangeConstant distance from end of market data. We don't want to add anything from the latest range as it's too soon to decide it as a min or max.
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
        priceData.close < priceData.open ? priceData.close : priceData.open;

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

const findSupportLevels = (coords: any[], order, closeRange) => {
  let sortedCoords;

  if (order === 'asc') {
    // Smallest to largest
    sortedCoords = coords.sort((first, second) => first.y - second.y);
  } else {
    // Largest to smallest
    sortedCoords = coords.sort((first, second) => second.y - first.y);
  }

  const supports = [];

  // Loop through the array...
  for (let i = 0; i < sortedCoords.length; i = 0) {
    const coordsFoundToBeClose = [sortedCoords[0]];
    let stillFindingCloseCoords = true;

    sortedCoords.splice(0, 1);

    while (stillFindingCloseCoords && sortedCoords.length > 0) {
      if (
        order === 'asc' &&
        coordsFoundToBeClose[0].y + closeRange > sortedCoords[0].y
      ) {
        coordsFoundToBeClose.push(sortedCoords[0]);
        sortedCoords.splice(0, 1);
      } else if (
        order === 'dsc' &&
        coordsFoundToBeClose[0].y - closeRange < sortedCoords[0].y
      ) {
        coordsFoundToBeClose.push(sortedCoords[0]);
        sortedCoords.splice(0, 1);
      } else {
        stillFindingCloseCoords = false;
      }
    }

    const sum = coordsFoundToBeClose.reduce((a, b) => a + b.y, 0);
    const median = sum / coordsFoundToBeClose.length;
    supports.push({
      y: median,
      frequency: coordsFoundToBeClose.length,
      points: coordsFoundToBeClose,
    });
  }
  return supports;
};

const applyToStrengthPriceMovementCross = (marketData, levels) => {
  const calculatedMarketData = calcDataArraySmooth(
    marketData,
    8,
    'close',
    'smooth',
  );
  console.log('levels', levels);

  calculatedMarketData.forEach((priceData, x) => {
    for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
      const level = levels[levelIndex];
      if (!level.numCrossPrice) {
        level.numCrossPrice = 0;
      }
      if (level.points[0].x <= x) {
        if (
          x !== 0 &&
          ((calculatedMarketData[x - 1].smooth < level.y &&
            level.y < priceData.smooth) ||
            (calculatedMarketData[x - 1].smooth > level.y &&
              level.y > priceData.smooth))
        ) {
          console.log('Brake');
          if (level.y === 6446.375) {
            console.log(level.numCrossPrice);
          }
          // Break the level
          level.numCrossPrice = level.numCrossPrice + 1;
        }
      }
    }
  });
  console.log('calculatedMarketData', calculatedMarketData);
  return levels;
};

export const calcTrendLines = (marketData: any[]) => {
  if (marketData.length === 0) return [];

  const { highs, lows, bodyHighs, bodyLows } = findMinMaxs(marketData, 20);
  console.log('marketData', marketData);
  const supports = findSupportLevels(
    // [...lows, ...highs],
    [...lows, ...bodyLows, ...highs, ...bodyHighs],
    'asc',
    marketData[marketData.length - 1].close * 0.15,
  );

  const newLevels = applyToStrengthPriceMovementCross(marketData, supports);
  // const supports = findSupportLevels(bodyLows, 'asc', 0.013);

  // const highSupports = findSupportLevels([...highs, ...bodyHighs], 'dsc');

  console.log('supports', newLevels);
  // console.log(highs);
  // console.log(lows);
  // console.log(bodyHighs);
  // console.log(bodyLows);
  return newLevels;
};

export const calcLevelStrength = (level, marketData) => {
  const noPriceCrossMultiplier = level.numCrossPrice === 0 ? 1 : 1;

  const strength = Math.floor(
    level.frequency - level.numCrossPrice * 2,
    // -
    // (marketData.length - 1 - level.points[level.points.length - 1].x) /
    //   10 /
    //   noPriceCrossMultiplier,
  );
  return strength;
};
