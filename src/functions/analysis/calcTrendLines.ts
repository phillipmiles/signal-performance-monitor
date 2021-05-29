import { calcDataArraySmooth } from '../metrics/transformPriceData';

const findMinMaxs = (marketData, rangeConstant) => {
  const rangeHighsArray = [];
  const rangeLowsArray = [];
  const rangeBodyHighsArray = [];
  const rangeBodyLowsArray = [];

  const savedPoints = [];

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
    if (range === 15 * rangeConstant) {
      console.log('bodyHigh', rangeBodyHigh, rangeHigh);
    }

    rangeHighsArray.push(rangeHigh);
    rangeLowsArray.push(rangeLow);
    rangeBodyHighsArray.push(rangeBodyHigh);
    rangeBodyLowsArray.push(rangeBodyLow);
  }
  console.log('RL', rangeLowsArray);
  // return {
  //   highs: rangeHighsArray,
  //   lows: rangeLowsArray,
  //   bodyHighs: rangeBodyHighsArray,
  //   bodyLows: rangeBodyLowsArray,
  // };
  // return savedPoints;
  return [
    ...rangeHighsArray,
    ...rangeLowsArray,
    ...rangeBodyHighsArray,
    ...rangeBodyLowsArray,
  ];
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
    // XXX TODO: WHEN CHOOSING A MEDIAN - MAYBE SHIFT CLOSER TO POINTS THAT
    // ARE IDENTIFIED AS TURNING POINTS (oe low high low or high low high).
    const median = sum / coordsFoundToBeClose.length;

    // Sort points by x value.
    coordsFoundToBeClose.sort((first, second) => first.x - second.x);

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
          // Break the level
          level.numCrossPrice = level.numCrossPrice + 1;
        }
      }
    }
  });
  console.log('calculatedMarketData', calculatedMarketData);
  return levels;
};
const mergeClosePoints = (
  points: any[],
  xRange: number,
  yRange: number,
): any[] => {
  points.sort((first, second) => first.x - second.x);
  const updatedPointsArray = [];

  // Loop through points array until it's empty.
  while (points.length > 0) {
    const closePoints = [points[0]];
    points.splice(0, 1);
    // Locate all points in range near observed point;
    let compareIndex = 0;
    // Loop through the next xRange points to find other close points.
    while (
      compareIndex < points.length &&
      closePoints[0].x + xRange >= points[compareIndex].x
    ) {
      if (closePoints[0].y <= points[compareIndex].y) {
        if (points[compareIndex].y - closePoints[0].y < yRange) {
          closePoints.push(points[compareIndex]);
          points.splice(compareIndex, 1);
          compareIndex = compareIndex - 1;
        }
      } else if (closePoints[0].y > points[compareIndex].y) {
        if (closePoints[0].y - points[compareIndex].y < yRange) {
          closePoints.push(points[compareIndex]);
          points.splice(compareIndex, 1);
          compareIndex = compareIndex - 1;
        }
      }
      compareIndex = compareIndex + 1;
    }

    console.log(closePoints.length);
    // Collect the average y position of all close point and store it and remove close points
    // from further comparisons in range.
    const sumY = closePoints.reduce(
      (accumulator, currentValue) => accumulator + currentValue.y,
      0,
    );
    const sumX = closePoints.reduce(
      (accumulator, currentValue) => accumulator + currentValue.x,
      0,
    );

    const avgYPos = sumY / closePoints.length;
    const avgXPos = Math.round(sumX / closePoints.length); // Need to round an index.

    while (closePoints.length > 0) {
      closePoints.splice(0, 1);
    }
    updatedPointsArray.push({ x: avgXPos, y: avgYPos });
  }
  console.log('updatedPointsArray', updatedPointsArray);
  return updatedPointsArray;
};

const filterClosePoints = (points: any[]) => {
  const filteredPoints = [];

  const sortedPoints = points.sort((first, second) => first.x - second.x);
  const groupedPoints = [];
  console.log('begin');
  for (let index = 0; index < sortedPoints.length; index++) {
    let closeIndex = index;
    const closePoints = [sortedPoints[index]];
    // console.log('big loop', sortedPoints[closeIndex + 1].x, index);
    // XXXXX NEED TO FIND A WAY TO FILTER POINTS NEAR ONE ANOTHER!!!!
    while (
      sortedPoints.length < closeIndex + 1 &&
      sortedPoints[closeIndex + 1].x < index + 5
    ) {
      closeIndex = closeIndex + 1;
      console.log(
        'der',
        sortedPoints,
        closeIndex,
        sortedPoints[closeIndex],
        sortedPoints[index].y + sortedPoints[index].y * 0.2,
        sortedPoints[closeIndex].y,
      );
      if (
        sortedPoints[index].y + sortedPoints[index].y * 0.2 >
          sortedPoints[closeIndex].y ||
        sortedPoints[index].y - sortedPoints[index].y * 0.2 <
          sortedPoints[closeIndex].y
      ) {
        // closePoints.push(sortedPoints[closeIndex]);
        // sortedPoints.splice(closeIndex, 1);
      }
    }
    groupedPoints.push(closePoints);
  }
  console.log('done');
  console.log('pp', groupedPoints);
  return points;
};

export const calcTrendLines = (marketData: any[], range) => {
  if (marketData.length === 0) return [];

  // Get points of interest.
  // const { highs, lows, bodyHighs, bodyLows } = findMinMaxs(marketData, range);
  const points = findMinMaxs(marketData, range);
  const points2 = [...points];
  console.log('POINTS', points);

  const filteredPoints = mergeClosePoints(
    points,
    2,
    marketData[marketData.length - 1].close * 0.1,
  );
  // const filteredPoints = filterClosePoints([
  //   ...lows,
  //   ...bodyLows,
  //   ...highs,
  //   ...bodyHighs,
  // ]);
  // return [];
  const supports = findSupportLevels(
    filteredPoints,
    'asc',
    marketData[marketData.length - 1].close * 0.12,
  );

  const newLevels = applyToStrengthPriceMovementCross(marketData, supports);
  // const supports = findSupportLevels(bodyLows, 'asc', 0.013);

  // const highSupports = findSupportLevels([...highs, ...bodyHighs], 'dsc');

  // console.log(highs);
  // console.log(lows);
  // console.log(bodyHighs);
  // console.log(bodyLows);
  return newLevels;
};

export const calcLevelStrength = (level, marketData) => {
  const noPriceCrossMultiplier = level.numCrossPrice === 0 ? 1 : 1;
  const recentRange = 20;

  const crossPriceAvgVal =
    level.numCrossPrice === 0 ? 1 : level.numCrossPrice * -1;

  // Checks if level was recently hit.
  const recentVal =
    level.points[level.points.length - 1].x >
    marketData.length - 1 - recentRange
      ? 1
      : 0;

  const strength = Math.floor(
    level.frequency + crossPriceAvgVal + recentVal,
    // +
    // level.points[level.points.length - 1].x >
    // marketData.length - 1 - recentRange
    // ? 1
    // : 0,
    // Penalising by distance is a great way of fucking up the subltlties of the
    // trendlines closer to current market price as all these lines just get bumped
    // up in strength.
    // (marketData.length - 1 - level.points[level.points.length - 1].x) / 20,
    // /
    //   noPriceCrossMultiplier,
  );
  console.log(strength);
  // XXXX I think current way of smoothening strength is fucked. If something is really
  // not strong it shouldn't destroy the subtlties in the really strong ones.
  // XXXX Maybe their should be a numCrossPrice val AND a numCrossPriceSinceLastPoint.
  // Points found on a line that was retested and hasn't since crossed back over
  // the price shouldn't be badly penalised. The line is still valid to some degree.
  return strength;
};
