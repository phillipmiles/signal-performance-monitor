/** @jsx jsx */
import { useEffect, useCallback, useState } from 'react';
import { useParams } from 'react-router';
import { jsx } from 'theme-ui';
import Market from './Market';
import ftxapi from '../api/ftx/api';
import { toMilliseconds, toSeconds } from '../util/time';
import { ema, rsi, getMouseCanvas } from 'react-financial-charts';
import {
  calcDataArrayMomentum,
  calcDataArraySmooth,
  calcDataArrayMA,
} from '../functions/metrics/transformPriceData';
import { findDataArrayMinimaMaxima } from '../functions/util/findMinimaMaxima';
import { emaCross } from '../functions/indicators/emaCross';
import {
  backTestMarketDataWithStrategy,
  calcProfitFromEvents,
} from '../functions/strategies/backTest';

const momentumOffset = 2800;
const period = 12;
const emaShort = ema()
  .id('short')
  .options({ windowSize: 10 })
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

const rsiCalculator = rsi()
  .options({ windowSize: 14 })
  .merge((d, c) => {
    d.rsi = c;
  })
  .accessor((d) => d.rsi);

const rsiOptions = rsiCalculator.options();
const rsiYAccessor = rsiCalculator.accessor();

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

const MarketContainer = () => {
  const [
    isIndicatorsSettingsPanelVisible,
    setIsIndicatorsSettingsPanelVisible,
  ] = useState(false);
  const [backTestResult, setBackTestResult] = useState();
  const [backTestEvents, setBackTestEvents] = useState([]);
  const [backTestBiggestGain, setBackTestBiggestGain] = useState();
  const [backTestBiggestLoss, setBackTestBiggestLoss] = useState();
  const [
    backTestNumberProfitTrades,
    setBackTestNumberProfitTrades,
  ] = useState();
  const [backTestNumberLossTrades, setBackTestNumberLossTrades] = useState();
  const [focusedDataItem, setFocusedDataItem] = useState({});
  const [isInfoPanelVisible, setIsInfoPanelVisible] = useState(false);
  const [isBackTestPanelVisible, setIsBackTestPanelVisible] = useState(false);
  const [marketData, setMarketData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedMarketData, setCalculatedMarketData] = useState([]);
  const [error, setError] = useState('');

  let { marketId } = useParams();
  const splitMarketId = marketId.split('_');
  const baseCoin = splitMarketId[0];
  const coinMarket = splitMarketId[1].toLowerCase();
  const marketSymbol = coinMarket === 'perp' ? '-' : '/';
  const apiMarketId = baseCoin + marketSymbol + coinMarket;
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

  const getHistoricalPrices = useCallback(
    async (marketId, resolution, startTime) => {
      const fetchData = async (marketId, resolution, startTime) => {
        const response = await ftxapi.getHistoricalPrices(
          marketId,
          resolution,
          startTime,
        );
        const data = response.data.result;

        // XXX This still needs testing!!!! Make sure we aren't re-adding the last
        // item.
        if (
          data[data.length - 1].time <
          new Date().getTime() - toMilliseconds(1, 'hours')
        ) {
          data.push(
            await fetchData(marketId, resolution, data[data.length - 1].time),
          );
        }

        return data;
      };
      console.log('start time', startTime);
      try {
        const data = await fetchData(
          marketId,
          // toSeconds(1, 'hours'),
          toSeconds(15, 'minutes'),
          // Need to take an hour off start time so we get the candle that
          // the startTime value is a part of.
          startTime - toMilliseconds(1, 'hours'),
        );
        setIsLoading(false);
        setMarketData(data);
      } catch (error) {
        setError(error.message);
      }
    },
    [],
  );

  const backTestStrategy = useCallback((marketData) => {
    const events = backTestMarketDataWithStrategy(
      marketData,
      // 'emaCrossStrategy',
      'emaCrossRetraceToMaStrategy',
    );
    console.log('events', events);
    const profit = calcProfitFromEvents(events);
    console.log('PROFIT', profit);
    setBackTestEvents(events);
    setBackTestResult(profit);
    setBackTestBiggestGain(profit.biggestGain);
    setBackTestBiggestLoss(profit.biggestLoss);
    setBackTestNumberProfitTrades(profit.numberProfitTrades);
    setBackTestNumberLossTrades(profit.numberLossTrades);
  }, []);

  useEffect(() => {
    backTestStrategy(marketData);
  }, [backTestStrategy, marketData]);

  useEffect(() => {
    setIsLoading(true);
    getHistoricalPrices(
      apiMarketId,
      60,
      new Date().getTime() - toMilliseconds(21, 'days'),
    );
  }, [getHistoricalPrices, apiMarketId]);

  useEffect(() => {
    const fillData = async () => {
      let calculatedData = calcDataArrayMA(
        calcDataArrayMA(
          emaCross(
            rsiCalculator(
              calcDataArrayMomentum(
                calcDataArrayMomentum(
                  emaLong(
                    calcDataArraySmooth(
                      emaDouble(emaShort(marketData)),
                      period / 2,
                      'close',
                      'smooth',
                    ),
                  ),
                  period / 2,
                  'smooth', // USE smooth OR emaDouble
                  'momentum1',
                ),
                period / 2,
                'momentum1',
                'momentum2',
              ),
            ),
            'emaShort',
            'emaLong',
          ),
          100,
          'close',
          'ma100',
        ),
        200,
        'close',
        'ma200',
      );

      console.log('DATA', calculatedData);

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

      // Add trades
      let lastEventIndex = 0;

      const newData = [...calculatedData];
      // Get event index within market data array.
      const backtestEventsWithIndex = backTestEvents.map((event) => {
        const dataIndex = calculatedData.findIndex(
          (data) => data.time === event.time,
        );

        return { ...event, index: dataIndex };
      });

      backtestEventsWithIndex.forEach((event, index) => {
        let profit = 0;
        if (
          event.type === 'entry' &&
          backtestEventsWithIndex.length > index + 1
        ) {
          if (event.position === 'long') {
            profit =
              newData[backtestEventsWithIndex[index + 1].index].close -
              newData[event.index].close;
          } else {
            profit =
              newData[event.index].close -
              newData[backtestEventsWithIndex[index + 1].index].close;
          }
        } else if (event.type === 'exit') {
          if (event.position === 'long') {
            profit =
              newData[event.index].close -
              newData[backtestEventsWithIndex[index - 1].index].close;
          } else {
            profit =
              newData[backtestEventsWithIndex[index - 1].index].close -
              newData[event.index].close;
          }
        }
        const eventData = {
          type: event.type,
          position: event.position,
          profit: profit,
        };

        if (!newData[event.index].backtestEvents) {
          newData[event.index].backtestEvents = [eventData];
        } else {
          newData[event.index].backtestEvents.push(eventData);
        }
      });

      // calculatedData = calculatedData.map((data, dataIndex) => {
      //   // console.log('backTestEvents', backTestEvents);
      //   const backtestEvents = backTestEvents.filter(
      //     (event) => data.time === event.time,
      //   );
      //   if (backtestEvents.length > 0) {
      //     // console.log(backtestEvents);
      //     let backtestData = [];
      //     backtestEvents.forEach((event, index) => {
      //       let profit = 0;
      //       if (event.type === 'buy') {
      //          backtestEvents[index + 1];
      //       }
      //       // if (event.position === 'long') {
      //       //   profit = profit * -1;
      //       // }
      //       backtestData.push({
      //         type: event.type,
      //         position: event.position,
      //         profit: profit,
      //       });
      //     });

      //     // console.log('SAVE', backtestData);
      //     return { ...data, backtestEvents: backtestData };
      //   } else {
      //     return { ...data };
      //   }
      // });
      setCalculatedMarketData(newData);
    };

    fillData();
  }, [marketData, backTestEvents]);

  const toggleIndicatorsSettingsPanel = useCallback(() => {
    if (isBackTestPanelVisible) setIsBackTestPanelVisible(false);
    if (isInfoPanelVisible) setIsInfoPanelVisible(false);
    setIsIndicatorsSettingsPanelVisible(!isIndicatorsSettingsPanelVisible);
  }, [
    isInfoPanelVisible,
    isIndicatorsSettingsPanelVisible,
    isBackTestPanelVisible,
  ]);

  const toggleInfoPanel = useCallback(() => {
    if (isBackTestPanelVisible) setIsBackTestPanelVisible(false);
    if (isIndicatorsSettingsPanelVisible)
      setIsIndicatorsSettingsPanelVisible(false);
    setIsInfoPanelVisible(!isInfoPanelVisible);
  }, [
    isIndicatorsSettingsPanelVisible,
    isInfoPanelVisible,
    isBackTestPanelVisible,
  ]);

  const toggleBackTestPanel = useCallback(() => {
    if (isInfoPanelVisible) setIsInfoPanelVisible(false);
    if (isIndicatorsSettingsPanelVisible)
      setIsIndicatorsSettingsPanelVisible(false);
    setIsBackTestPanelVisible(!isBackTestPanelVisible);
  }, [
    isIndicatorsSettingsPanelVisible,
    isInfoPanelVisible,
    isBackTestPanelVisible,
  ]);

  const updateFocusedDataItem = useCallback((dataItem) => {
    setFocusedDataItem(dataItem);
  }, []);

  // const iDunno = getMouseCanvas();
  return (
    <Market
      marketId={apiMarketId}
      onHoverCandle={updateFocusedDataItem}
      focusedDataItem={focusedDataItem}
      isLoadingData={isLoading}
      marketData={calculatedMarketData}
      error={error}
      trends={trends}
      emaShort={emaShort}
      emaLong={emaLong}
      emaDouble={emaDouble}
      rsiOptions={rsiOptions}
      rsiYAccessor={rsiYAccessor}
      isInfoPanelVisible={isInfoPanelVisible}
      toggleInfoPanel={toggleInfoPanel}
      isIndicatorsSettingsPanelVisible={isIndicatorsSettingsPanelVisible}
      toggleIndicatorsSettingsPanel={toggleIndicatorsSettingsPanel}
      backTestBiggestGain={backTestBiggestGain && backTestBiggestGain.value}
      backTestBiggestLoss={backTestBiggestGain && backTestBiggestLoss.value}
      backTestNumberProfitTrades={backTestNumberProfitTrades}
      backTestNumberLossTrades={backTestNumberLossTrades}
      numBackTestEntries={backTestEvents.reduce(
        (accumulator, currentValue) =>
          currentValue.type === 'entry' ? accumulator + 1 : accumulator,
        0,
      )}
      numBackTestExits={backTestEvents.reduce(
        (accumulator, currentValue) =>
          currentValue.type === 'exit' ? accumulator + 1 : accumulator,
        0,
      )}
      isBackTestPanelVisible={isBackTestPanelVisible}
      toggleBackTestPanel={toggleBackTestPanel}
      backTestResult={backTestResult}
    />
  );
};

export default MarketContainer;
