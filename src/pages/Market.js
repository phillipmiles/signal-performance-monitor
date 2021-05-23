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
import {
  calcDataArrayMomentum,
  calcDataArraySmooth,
} from '../functions/metrics/transformPriceData';
import { findDataArrayMinimaMaxima } from '../functions/util/findMinimaMaxima';
// FOR CORRECTION ALGORITHIM...
// Could assign less weight to indexs close to the edges of the period range. This would prevent
// the correction picking highs and lows that aren't necessarily local and is actually
// a seperate high already picked up by another local maxima/minima.
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

const isValBetween = (val, val2, val3) => {
  if ((val > val2 && val <= val3) || (val > val2 && val <= val3)) {
    return true;
  }
  return false;
};

// Array, va
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

  const period = 10;
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

  const calculatedData = calcDataArrayMomentum(
    calcDataArrayMomentum(
      emaLong(
        // calcDataArraySmooth(
        calcDataArraySmooth(
          emaDouble(emaShort(initialMarketData)),
          period / 2,
          'close',
          'smooth',
        ),
        // period / 2,
        //   (candle) => {
        //     return (candle.low + candle.high) / 2;
        //   },
        //   'smoothAvgPriceRange',
        // ),
        // // calcSmoothArray(emaDouble(emaShort(initialMarketData)), period / 2),
      ),
      // period / 2,
      period,
      'smooth', // USE smooth OR emaDouble
      'momentum1',
    ),
    // period / 2,
    period,
    'momentum1',
    'momentum2',
  );

  const momentumOffset = 2800;
  console.log('cher!', calculatedData);
  useEffect(() => {
    // const highs = [];
    // const lows = [];
    const { minima, maxima } = findDataArrayMinimaMaxima(
      calculatedData,
      'momentum1',
      'momentum2',
    );

    const correctedHighs = correctHighs(calculatedData, maxima, period / 2);
    const correctedLows = correctLows(calculatedData, minima, period / 2);

    const combineLowsAndHighs = [...correctedLows, ...correctedHighs];
    const lowHighsWithStrength = combineLowsAndHighs.map((item) => {
      let numNear = 0;
      let sumNear = 0;
      // console.log('nn', numNear);
      combineLowsAndHighs.forEach((itemCompare) => {
        if (itemCompare.index === item.index) return;

        if (
          itemCompare.value < item.value + item.value * 0.015 &&
          itemCompare.value > item.value - item.value * 0.015
        ) {
          // console.log(itemCompare[1], item[1]);
          // console.log('new num', indexCompare, numNear);
          numNear = numNear + 1;
          sumNear = sumNear + itemCompare.value;
          // HOW AND WHERE AM I STORING UBER LINES!!?!?
        }
      });
      // console.log('nn', numNear);
      return {
        index: item.index,
        value: item.value,
        // value2: item[2],
        numNear: numNear,
        avgLine: sumNear / numNear,
      };
    });

    console.log(
      'lowHighsWithStrength',
      combineLowsAndHighs,
      lowHighsWithStrength,
    );

    const linesToSave = [];

    lowHighsWithStrength.forEach((level) => {
      // const yPos = level.avgLine ? level.avgLine : level.value;
      const yPos = level.value;
      // if(level.numNear < 1) return;
      linesToSave.push(
        {
          // type: level.numNear > 6 ? 'RAY' : 'LINE',
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
                yAccessor={(d) => d.smoothAvgPriceRange}
                strokeStyle="#0011FF"
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
