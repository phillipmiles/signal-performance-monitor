/** @jsx jsx */
import { jsx } from 'theme-ui';
import PropTypes from 'prop-types';
import {
  Chart,
  ChartCanvas,
  CandlestickSeries,
  YAxis,
  XAxis,
  discontinuousTimeScaleProviderBuilder,
  withDeviceRatio,
  withSize,
  LineSeries,
  ema,
  MovingAverageTooltip,
  TrendLine,
  CrossHairCursor,
} from 'react-financial-charts';
import { useCallback, useEffect, useState } from 'react';

const correctHighs = (dataArray, highsArray, period) => {
  const correctedHighs = highsArray.map((dataIndexSTRUCTURE) => {
    // RESTRUCTURE THE HIGHS ARRAY - JUST WANT INDEX. TO CHANGE....
    const dataIndex = dataIndexSTRUCTURE[0];
    let highestHigh = 0;
    let highestHighIndex = 0;

    let loopIndex = 0;
    for (
      loopIndex = dataIndex - period;
      loopIndex <= dataIndex + period;
      loopIndex++
    ) {
      if (highestHigh < dataArray[loopIndex].high) {
        highestHigh = dataArray[loopIndex].high;
        highestHighIndex = loopIndex;
      }
    }
    console.log('HH', dataIndex, highestHigh);
    const structure = [...dataIndexSTRUCTURE];
    structure[0] = highestHighIndex;
    structure[1] = highestHigh;
    return structure;
  });
  return correctedHighs;
};

const correctLows = (dataArray, highsArray, period) => {
  const correctedLows = highsArray.map((dataIndexSTRUCTURE) => {
    // RESTRUCTURE THE HIGHS ARRAY - JUST WANT INDEX. TO CHANGE....
    const dataIndex = dataIndexSTRUCTURE[0];
    let lowestLow;
    let lowestLowIndex = 0;

    let loopIndex = 0;
    for (
      loopIndex = dataIndex - period;
      loopIndex <= dataIndex + period;
      loopIndex++
    ) {
      if (lowestLow === undefined || lowestLow > dataArray[loopIndex].high) {
        lowestLow = dataArray[loopIndex].low;
        lowestLowIndex = loopIndex;
      }
    }
    console.log('HH', dataIndex, lowestLow);
    const structure = [...dataIndexSTRUCTURE];
    structure[0] = lowestLowIndex;
    structure[1] = lowestLow;
    return structure;
  });
  return correctedLows;
};

const calcSupport = (df, i) => {
  console.log(df[1]);
  const support =
    df[i].smooth < df[i - 1].smooth &&
    df[i].smooth < df[i + 1].smooth &&
    df[i + 1].smooth < df[i + 2].smooth &&
    df[i - 1].smooth < df[i - 2].smooth;

  return support;
};

const calcSmooth = (da, i, factor) => {
  let sum = 0;
  let loopedIndex;
  for (loopedIndex = i - factor; loopedIndex <= i + factor; loopedIndex++) {
    sum = sum + da[loopedIndex].close;
  }

  const smoothed = sum / (factor * 2);

  return smoothed;
};

const calcSmoothArray = (dataArray, smoothFactor) => {
  const smoothedData = dataArray.map((data, i) => {
    if (i < smoothFactor || i > dataArray.length - smoothFactor) return data;
    let sum = 0;

    let loopedIndex;
    for (
      loopedIndex = i - smoothFactor;
      loopedIndex < i + smoothFactor;
      loopedIndex++
    ) {
      // sum = sum + ((dataArray[loopedIndex].high + dataArray[loopedIndex].low) / 2);
      // sum = sum + ((dataArray[loopedIndex].close + dataArray[loopedIndex].open) / 2);
      sum = sum + dataArray[loopedIndex].close;
    }

    const smoothed = sum / (smoothFactor * 2);

    return { ...data, smooth: smoothed };
  });
  console.log('SMOOTHED', smoothedData);
  return smoothedData;
};

const calcMomentum = (array, key, factor, newKey) => {
  const momentumData = array.map((data, i) => {
    if (i < factor) return data;

    // const momentum = (data[key] / array[i - factor][key]) * 100;
    const momentum = data[key] - array[i - factor][key];

    const newData = { ...data };
    newData[newKey] = momentum;
    return newData;
  });
  console.log('momentumData', momentumData);
  return momentumData;
};

const didValueCrossZero = (array, value, i) => {
  if (array[i][value] >= 0 && array[i - 1][value] < 0) {
    if (array[i][value] + array[i - 1][value] < 0) {
      console.log('CROSS +ve prev');
      return 1;
    }
  } else if (array[i][value] <= 0 && array[i - 1][value] > 0) {
    if (array[i][value] + array[i - 1][value] > 0) {
      console.log('CROSS -ve prev');
      return -1;
    }
  } else if (
    i + 1 < array.length &&
    array[i][value] <= 0 &&
    array[i + 1][value] > 0
  ) {
    if (array[i][value] + array[i + 1][value] > 0) {
      console.log('CROSS +ve next');
      return 1;
    }
  } else if (
    i + 1 < array.length &&
    array[i][value] >= 0 &&
    array[i + 1][value] < 0
  ) {
    if (array[i][value] + array[i + 1][value] < 0) {
      console.log('CROSS -ve next');
      return -1;
    }
  }
  return false;
};

const MarketView = ({
  marketId,
  isLoadingBooks,
  marketData: initialMarketData,
  error,
  ratio,
  width,
  height,
}) => {
  const [trends, setTrends] = useState([
    {
      type: 'LINE',
      selected: false,
      start: [110, 41329.107142857145],
      end: [158, 48078.66071428571],
      appearance: {
        edgeFill: '#FFFFFF',
        edgeStroke: '#000000',
        edgeStrokeWidth: 1,
        r: 6,
        strokeDasharray: 'Solid',
        strokeStyle: '#000000',
        strokeWidth: 1,
      },
    },
    {
      type: 'LINE',
      selected: false,
      // Size of x axies is from 0 to number of data points.
      start: [0, 41329.107142857145],
      end: [168, 48078.66071428571],
      appearance: {
        edgeFill: '#FFFFFF',
        edgeStroke: '#000000',
        edgeStrokeWidth: 1,
        r: 6,
        strokeDasharray: 'Solid',
        strokeStyle: '#000000',
        strokeWidth: 1,
      },
    },
  ]);

  const period = 20;
  const emaShort = ema()
    .id('short')
    .options({ windowSize: period })
    .merge((d, c) => {
      d.emaShort = c;
    })
    .accessor((d) => d.emaShort);
  const emaLong = ema()
    .id('long')
    .options({ windowSize: 21 })
    .merge((d, c) => {
      d.emaLong = c;
    })
    .accessor((d) => d.emaLong);

  const emaDouble = ema()
    .id('double')
    .options({ windowSize: period, sourcePath: 'emaShort' })
    .merge((d, c) => {
      d.emaDouble = c;
    })
    .accessor((d) => d.emaDouble);

  const calculatedData = calcMomentum(
    calcMomentum(
      emaLong(
        calcSmoothArray(emaDouble(emaShort(initialMarketData)), period / 2),
      ),
      'smooth', // USE smooth OR emaDouble
      period / 2,
      'momentum1',
    ),
    'momentum1',
    period / 2,
    'momentum2',
  );

  const momentumOffset = 3000;
  console.log('cher!', calculatedData);
  useEffect(() => {
    const highs = [];
    const lows = [];

    // const smoothData = calcSmoothArray(initialMarketData, 6);
    // const momentum1 = calcMomentum(smoothData, 'smooth', 10, 'momentum1');
    // const momentum2 = calcMomentum(momentum1, 'momentum1', 10, 'momentum2');
    // console.log('momentum2', momentum2);
    // smoothData.forEach((d, index) => {
    //   if (index < 2 || index > smoothData.length - 3) return;

    //   if (calcSupport(smoothData, index)) {
    //     // levels.push([index, d.low]);
    //     if (d.close < d.open) {
    //       levels.push([index, d.close]);
    //     } else {
    //       levels.push([index, d.open]);
    //     }
    //   }
    // });

    calculatedData.forEach((d, index) => {
      if (!d.momentum1) return;
      const crossDirection = didValueCrossZero(
        calculatedData,
        'momentum2',
        index,
      );

      if (crossDirection) {
        if (d.momentum1 > 0) {
          // highs.push([index, d.high]);
          if (d.close > d.open) {
            highs.push([index, d.high, d.close]);
          } else {
            highs.push([index, d.high, d.open]);
          }
        } else {
          if (d.close < d.open) {
            lows.push([index, d.low, d.close]);
          } else {
            lows.push([index, d.low, d.open]);
          }
          // lows.push([index, d.low]);
        }
      }
    });

    const correctedHighs = correctHighs(calculatedData, highs, period / 2);
    const correctedLows = correctLows(calculatedData, lows, period / 2);
    console.log(correctedHighs);

    const combineLowsAndHighs = [...correctedLows, ...correctedHighs];
    const lowHighsWithStrength = combineLowsAndHighs.map((item, index) => {
      let numNear = 0;
      let sumNear = 0;
      // console.log('nn', numNear);
      combineLowsAndHighs.forEach((itemCompare, indexCompare) => {
        if (itemCompare[1] === item[1]) return;

        if (
          itemCompare[1] < item[1] + item[1] * 0.015 &&
          itemCompare[1] > item[1] - item[1] * 0.015
        ) {
          // console.log(itemCompare[1], item[1]);
          // console.log('new num', indexCompare, numNear);
          numNear = numNear + 1;
          sumNear = sumNear + itemCompare[1];
          // HOW AND WHERE AM I STORING UBER LINES!!?!?
        }
      });
      // console.log('nn', numNear);
      return {
        index: item[0],
        value: item[1],
        value2: item[2],
        numNear: numNear,
        avgLine: sumNear / numNear,
      };
    });

    console.log(
      'lowHighsWithStrength',
      combineLowsAndHighs,
      lowHighsWithStrength,
    );

    const highsToSave = highs.map((level) => {
      return {
        type: 'LINE',
        selected: false,
        // Size of x axies is from 0 to number of data points.
        start: level,
        end: [level[0] + 10, level[1]],
        appearance: {
          edgeFill: '#FFFFFF',
          edgeStroke: '#000000',
          edgeStrokeWidth: 1,
          r: 6,
          strokeDasharray: 'Solid',
          strokeStyle: '#FF0000',
          strokeWidth: 3,
        },
      };
    });

    const lowsToSave = lows.map((level) => {
      return {
        type: 'LINE',
        selected: false,
        // Size of x axies is from 0 to number of data points.
        start: level,
        end: [level[0] + 10, level[1]],
        appearance: {
          edgeFill: '#FFFFFF',
          edgeStroke: '#000000',
          edgeStrokeWidth: 1,
          r: 6,
          strokeDasharray: 'Solid',
          strokeStyle: '#00CC22',
          strokeWidth: 3,
        },
      };
    });

    const linesToSave = [];
    lowHighsWithStrength.forEach((level) => {
      // const yPos = level.avgLine ? level.avgLine : level.value;
      const yPos = level.value;
      // if(level.numNear < 1) return;
      linesToSave.push(
        {
          type: 'LINE',
          selected: false,
          // Size of x axies is from 0 to number of data points.
          start: [level.index, yPos],
          end: [level.index + 10, yPos],
          appearance: {
            edgeFill: '#FFFFFF',
            edgeStroke: '#000000',
            edgeStrokeWidth: 1,
            r: 6,
            strokeDasharray: 'Solid',
            strokeStyle:
              level.numNear < 1
                ? '#DDDDDD'
                : level.numNear > 6
                ? level.numNear > 16
                  ? '#000000'
                  : '#888888'
                : '#AAAAAA',
            strokeWidth: 3,
          },
        },
        // Add close/open line as well
        // {
        //   type: 'LINE',
        //   selected: false,
        //   // Size of x axies is from 0 to number of data points.
        //   start: [level.index, level.value2],
        //   end: [level.index + 10, level.value2],
        //   appearance: {
        //     edgeFill: '#FFFFFF',
        //     edgeStroke: '#000000',
        //     edgeStrokeWidth: 1,
        //     r: 6,
        //     strokeDasharray: 'Solid',
        //     strokeStyle:
        //       level.numNear < 1
        //         ? '#DDDDDD'
        //         : level.numNear > 6
        //         ? level.numNear > 16
        //           ? '#000000'
        //           : '#888888'
        //         : '#AAAAAA',
        //     strokeWidth: 3,
        //   },
        // },
      );
    });

    setTrends([
      ...linesToSave,
      // ...highsToSave,
      // ...lowsToSave,
      {
        type: 'RAY',
        selected: false,
        // Size of x axies is from 0 to number of data points.
        start: [0, momentumOffset],
        end: [168, momentumOffset],
        appearance: {
          edgeFill: '#FFFFFF',
          edgeStroke: '#000000',
          edgeStrokeWidth: 1,
          r: 6,
          strokeDasharray: 'Solid',
          strokeStyle: '#000000',
          strokeWidth: 1,
        },
      },
    ]);
  }, [initialMarketData]);

  const onDrawTrendComplete = useCallback((event, trends) => {
    console.log('HEEERERE');
    console.log(trends);
    setTrends(trends);
  }, []);

  const xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
    (d) => new Date(d.time),
  );

  const yExtents = (data) => {
    return [data.high, data.low];
  };

  const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(
    calculatedData,
  );

  const max = xAccessor(data[data.length - 1]);
  const min = xAccessor(data[Math.max(0, data.length - 100)]);
  const xExtents = [min, max];

  return (
    <div>
      <h1>{marketId}</h1>
      {/* {isLoadingBooks && <p>Loading</p>} */}
      {error && <p>{error} </p>}
      <div>
        {initialMarketData.length > 0 && (
          <ChartCanvas
            data={data}
            seriesName="Data"
            xScale={xScale}
            displayXAccessor={displayXAccessor}
            xAccessor={xAccessor}
            ratio={ratio}
            width={width}
            height={height}
            xExtents={xExtents}
          >
            <Chart id={1} yExtents={yExtents}>
              <CandlestickSeries />
              <LineSeries
                yAccessor={emaShort.accessor()}
                strokeStyle={emaShort.stroke()}
              />
              <LineSeries
                yAccessor={emaLong.accessor()}
                strokeStyle={emaLong.stroke()}
              />
              <LineSeries
                yAccessor={emaDouble.accessor()}
                strokeStyle={emaDouble.stroke()}
              />

              <LineSeries
                yAccessor={(d) => d.smooth}
                strokeStyle="#00FF11"
                strokeWidth={2}
              />
              <LineSeries
                yAccessor={(d) => d.momentum1 + momentumOffset}
                strokeStyle="#FF0011"
                strokeWidth={1}
              />
              <LineSeries
                yAccessor={(d) => d.momentum2 + momentumOffset}
                strokeStyle="#000000"
                strokeWidth={1}
              />
              <TrendLine
                type="LINE"
                snap={false}
                enabled={false}
                snapTo={(d) => [d.high, d.low]}
                onStart={() => console.log('START')}
                onSelect={() => console.log('SELECT')}
                onDrag={() => console.log('DO NOTHING ON DRAG')}
                onDragComplete={() => console.log('DO NOTHING ON DRAG')}
                onComplete={onDrawTrendComplete}
                trends={trends}
              />
              <XAxis
              // ticks={6}
              />
              <YAxis
              //  ticks={5}
              />
              <MovingAverageTooltip
                origin={[8, 0]}
                options={[
                  {
                    stroke: emaShort.stroke(),
                    type: 'EMA',
                    windowSize: emaShort.options().windowSize,
                    yAccessor: emaShort.accessor(),
                  },
                  {
                    stroke: emaLong.stroke(),
                    type: 'EMA',
                    windowSize: emaLong.options().windowSize,
                    yAccessor: emaLong.accessor(),
                  },
                ]}
              />
              <CrossHairCursor />
            </Chart>
          </ChartCanvas>
        )}
      </div>
      {/* {books.map((book) => (
        <p key={book.id}>{book.title}</p>
      ))} */}
    </div>
  );
};

MarketView.propTypes = {
  books: PropTypes.array,
  isLoadingBooks: PropTypes.bool,
  loadingBooksError: PropTypes.string,
};

MarketView.defaultProps = {
  books: [],
  isLoadingBooks: false,
  loadingBooksError: '',
};

export default withSize({ style: { minHeight: 740 } })(
  withDeviceRatio()(MarketView),
);
