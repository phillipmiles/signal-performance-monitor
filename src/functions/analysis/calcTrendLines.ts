import {
  calcDataArrayMomentum,
  calcDataArraySmooth,
} from '../metrics/transformPriceData';
import { findDataArrayMinimaMaxima } from '../util/findMinimaMaxima';

const findHighLowsInRange = (marketData, rangeConstant) => {
  const rangeHighsArray = [];
  const rangeLowsArray = [];
  const rangeBodyHighsArray = [];
  const rangeBodyLowsArray = [];

  for (
    let range = 0;
    range < marketData.length - rangeConstant; // Run array to rangeConstant distance from end of market data. We don't want to add anything from the latest range as it's too soon to decide it as a min or max.
    range = range + rangeConstant
  ) {
    let rangeHigh = { x: 0, y: 0, position: 'high', strength: 1 };
    let rangeLow = {
      x: range,
      y: marketData[range].low,
      position: 'low',
      strength: 1,
    };
    let rangeBodyHigh = { x: 0, y: 0, position: 'bodyHigh', strength: 1 };
    let rangeBodyLow = {
      x: range,
      y:
        marketData[range].close < marketData[range].open
          ? marketData[range].close
          : marketData[range].open,
      position: 'bodyLow',
      strength: 1,
    };

    for (
      let i = range;
      i < range + rangeConstant && i < marketData.length;
      i++
    ) {
      const priceData = marketData[i];
      if (priceData.high > rangeHigh.y) {
        rangeHigh = { x: i, y: priceData.high, position: 'high', strength: 1 };
      }

      if (priceData.low < rangeLow.y) {
        rangeLow = { x: i, y: priceData.low, position: 'low', strength: 1 };
      }

      const bodyHigh =
        priceData.close > priceData.open ? priceData.close : priceData.open;
      const bodyLow =
        priceData.close < priceData.open ? priceData.close : priceData.open;

      if (bodyHigh > rangeBodyHigh.y) {
        rangeBodyHigh = {
          x: i,
          y: bodyHigh,
          position: 'bodyHigh',
          strength: 1,
        };
      }

      if (bodyLow < rangeBodyLow.y) {
        rangeBodyLow = { x: i, y: bodyLow, position: 'bodyLow', strength: 1 };
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
  console.log(
    'RL',
    rangeLowsArray,
    rangeHighsArray,
    rangeBodyHighsArray,
    rangeBodyLowsArray,
  );
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
    const strength = coordsFoundToBeClose.reduce((a, b) => a + b.strength, 0);
    // XXX TODO: WHEN CHOOSING A MEDIAN - MAYBE SHIFT CLOSER TO POINTS THAT
    // ARE IDENTIFIED AS TURNING POINTS (oe low high low or high low high).
    const median = sum / coordsFoundToBeClose.length;

    // Sort points by x value.
    coordsFoundToBeClose.sort((first, second) => first.x - second.x);

    supports.push({
      y: median,
      frequency: coordsFoundToBeClose.length,
      points: coordsFoundToBeClose,
      strength: strength,
    });
  }

  return supports;
};

const applyToStrengthPriceMovementCross = (marketData, levels) => {
  const calculatedMarketData = calcDataArraySmooth(
    marketData,
    8,
    'close',
    'smoothSupportStrength',
  );

  calculatedMarketData.forEach((priceData, x) => {
    for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
      const level = levels[levelIndex];
      if (!level.numCrossPrice) {
        level.numCrossPrice = 0;
      }
      if (level.points[0].x <= x) {
        if (
          x !== 0 &&
          ((calculatedMarketData[x - 1].smoothSupportStrength < level.y &&
            level.y < priceData.smoothSupportStrength) ||
            (calculatedMarketData[x - 1].smooth > level.y &&
              level.y > priceData.smoothSupportStrength))
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

    const sumStrength = closePoints.reduce(
      (accumulator, currentValue) => accumulator + currentValue.strength,
      0,
    );

    const avgYPos = sumY / closePoints.length;
    const avgXPos = Math.round(sumX / closePoints.length); // Need to round an index.
    // Take off strength value for merge. But include any additional strength for special points.
    const avgStrength = 1 + sumStrength - closePoints.length;

    // while (closePoints.length > 0) {
    //   closePoints.splice(0, 1);
    // }
    updatedPointsArray.push({
      x: avgXPos,
      y: avgYPos,
      position: 'closeAverage',
      strength: avgStrength,
      points: closePoints,
    });
  }
  console.log('updatedPointsArray', updatedPointsArray);
  return updatedPointsArray;
};

const filterPoints = (points) => {
  return points;
};

// FOR CORRECTION ALGORITHIM...
// Could assign less weight to indexs close to the edges of the period range. This would prevent
// the correction picking highs and lows that aren't necessarily local and is actually
// a seperate high already picked up by another local maxima/minima.

// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// MAKE SURE ANY CORRECTED POSITIONS have a lower point on either side of it
// If there are none within the period then reject the position entirely
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
const correctHighs = (dataArray, highsArray, period) => {
  const correctedHighs = highsArray.map((dataIndex) => {
    let highestHigh = 0;
    let highestHighIndex = 0;
    let loopIndex = 0;
    for (
      loopIndex = dataIndex - period;
      loopIndex <= dataIndex + period && dataArray.length > dataIndex + period;
      loopIndex++
    ) {
      if (highestHigh < dataArray[loopIndex].high) {
        // ADD SOME KIND OF DEMINISHING FACTOR WHEN LOOPINDEX IS FAR FROM DATAINDEX
        // Use it to flatten this high down? Or how do I use it?
        highestHigh = dataArray[loopIndex].high;
        highestHighIndex = loopIndex;
      }
    }
    // console.log('HH', dataIndex, highestHigh);
    // const structure = [...dataIndexSTRUCTURE];
    // structure[0] = highestHighIndex;
    // structure[1] = highestHigh;

    // if (dataArray[highestHighIndex].close > dataArray[highestHighIndex].open) {
    //   structure[2] = dataArray[highestHighIndex].close;
    // } else {
    //   structure[2] = dataArray[highestHighIndex].open;
    // }

    return { index: highestHighIndex, value: highestHigh };
  });
  return correctedHighs;
};

const correctLows = (dataArray, highsArray, period) => {
  const correctedLows = highsArray.map((dataIndex) => {
    let lowestLow;
    let lowestLowIndex = 0;
    let loopIndex = 0;
    for (
      loopIndex = dataIndex - period;
      loopIndex <= dataIndex + period && dataArray.length > dataIndex + period;
      loopIndex++
    ) {
      if (lowestLow === undefined || lowestLow > dataArray[loopIndex].low) {
        lowestLow = dataArray[loopIndex].low;
        lowestLowIndex = loopIndex;
      }
    }
    // console.log('HH', dataIndex, lowestLow);
    // const structure = [...dataIndexSTRUCTURE];
    // structure[0] = lowestLowIndex;
    // structure[1] = lowestLow;

    // // NEED TO DO THE SAME ABOVE FOR HIGHEST AND LOWSET CLOSE AND OPENS
    // if (dataArray[lowestLowIndex].close < dataArray[lowestLowIndex].open) {
    //   structure[2] = dataArray[lowestLowIndex].close;
    // } else {
    //   structure[2] = dataArray[lowestLowIndex].open;
    // }

    return { index: lowestLowIndex, value: lowestLow };
  });
  return correctedLows;
};

const findTurningPoints = (marketData) => {
  const calculatedData = calcDataArrayMomentum(
    calcDataArrayMomentum(
      calcDataArraySmooth(marketData, 8, 'close', 'smoothTurningPoints'),
      8,
      'smoothTurningPoints', // USE smooth OR emaDouble
      'momentumTurningPoints1',
    ),
    8,
    'momentumTurningPoints1',
    'momentumTurningPoints2',
  );

  const { minima, maxima } = findDataArrayMinimaMaxima(
    calculatedData,
    'momentumTurningPoints1',
    'momentumTurningPoints2',
  );

  console.log('mm', minima, maxima);
  const turningPoints = [];
  const correctedHighs = correctHighs(calculatedData, maxima, 8);
  const correctedLows = correctLows(calculatedData, minima, 8);

  correctedHighs.forEach((point) => {
    turningPoints.push({
      x: point.index,
      y: point.value,
      position: 'high',
      strength: 2,
      detectionMethod: 'localMinMax',
    });
  });
  correctedLows.forEach((point) => {
    turningPoints.push({
      x: point.index,
      y: point.value,
      position: 'low',
      strength: 2,
      detectionMethod: 'localMinMax',
    });
  });

  return turningPoints;
};

export const calcTrendLines = (marketData: any[], range) => {
  if (marketData.length === 0) return [];

  // Get points of interest.
  const points = findHighLowsInRange(marketData, range);
  const turningPoints = findTurningPoints(marketData);
  const combinedPoints = [...points, ...turningPoints];
  console.log('turningPoints', turningPoints);

  // Remove points that are just bad.
  const filteredPoints = filterPoints(combinedPoints);

  // const mergeRate = 0;
  const mergeRate = 0.1;

  // Merge together points that are really close together.
  const mergedPoints = mergeClosePoints(
    filteredPoints,
    5,
    marketData[marketData.length - 1].close * mergeRate,
  );

  const supports = findSupportLevels(
    mergedPoints,
    'asc',
    marketData[marketData.length - 1].close * mergeRate,
  );

  const newLevels = applyToStrengthPriceMovementCross(marketData, supports);

  return newLevels;
};

export const calcLevelStrength = (level, marketData) => {
  const recentRange = 20;

  const crossPriceAvgVal =
    level.numCrossPrice === 0 ? 1 : level.numCrossPrice * -1;

  // Checks if level was recently hit.
  const recentVal =
    level.points[level.points.length - 1].x >
    marketData.length - 1 - recentRange
      ? 1
      : 0;

  const distanceVal =
    (marketData.length - level.points[level.points.length - 1].x) / recentRange;
  console.log('level', level);
  let strength = Math.floor(
    level.strength + level.frequency + crossPriceAvgVal + recentVal,
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

  strength = Math.floor(level.strength - level.numCrossPrice - distanceVal);
  console.log(strength);
  // XXXX I think current way of smoothening strength is fucked. If something is really
  // not strong it shouldn't destroy the subtlties in the really strong ones.
  // XXXX Maybe their should be a numCrossPrice val AND a numCrossPriceSinceLastPoint.
  // Points found on a line that was retested and hasn't since crossed back over
  // the price shouldn't be badly penalised. The line is still valid to some degree.
  // return strength;
  return strength;
};
