/** @jsx jsx */
import { useThemeUI } from "theme-ui";
import { useEffect, useCallback, useState } from "react";
import { useParams } from "react-router";
import { jsx } from "theme-ui";
import Market from "./Market";
import ftxapi from "../api/ftx/api";
import { toMilliseconds, toSeconds } from "../util/time";
import {
  ema,
  rsi,
  getMouseCanvas,
  stochasticOscillator,
} from "react-financial-charts";
import {
  calcDataArrayMomentum,
  calcDataArraySmooth,
  calcDataArrayVWAP,
  calcDataArraySmoothAvg,
  calcDataArrayMA,
  calcDataArrayPP,
  calcDataArrayDirectionExtremes,
} from "../functions/metrics/transformPriceData";
import { findDataArrayMinimaMaxima } from "../functions/util/findMinimaMaxima";
import { emaCross } from "../functions/indicators/emaCross";
import { stochasticCross } from "../functions/indicators/stochasticCross";
import { vwapCross } from "../functions/indicators/vwapCross";
import { swingHigh, swingLow } from "../functions/indicators/swing";

import {
  backTestMarketDataWithStrategy,
  calcProfitFromEvents,
} from "../functions/strategies/backTest";
import { backTestWithStrategy } from "../functions/strategies/backTestv2";

import {
  calcLevelStrength,
  calcTrendLines,
} from "../functions/analysis/calcTrendLines";
import findPivotSupports from "../functions/analysis/findPivotSupports";

// new Date().getTime() - toMilliseconds(656, 'days'),
// new Date().getTime() - toMilliseconds(307, 'days'),
// new Date().getTime() - toMilliseconds(500, 'days'),
// new Date().getTime() - toMilliseconds(300, "days"),
const startTime = new Date().getTime() - toMilliseconds(20, "days");

const momentumOffset = 2800;
const period = 16;
const emaShort = ema()
  .id("short")
  .options({ windowSize: 9 })
  .merge((d, c) => {
    d.emaShort = c;
  })
  .accessor((d) => d.emaShort);
const emaLong = ema()
  .id("long")
  .options({ windowSize: 21 })
  .merge((d, c) => {
    d.emaLong = c;
  })
  .accessor((d) => d.emaLong);

const emaDouble = ema()
  .id("double")
  .options({ windowSize: period, sourcePath: "emaShort" })
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

const fullSTO = stochasticOscillator()
  .options({ windowSize: 14, kWindowSize: 3, dWindowSize: 4 })
  .merge((d, c) => {
    d.fullSTO = c;
  })
  .accessor((d) => d.fullSTO);

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
  const { theme } = useThemeUI();
  const [
    isIndicatorsSettingsPanelVisible,
    setIsIndicatorsSettingsPanelVisible,
  ] = useState(false);
  const [backTestResult, setBackTestResult] = useState();
  const [backTestEvents, setBackTestEvents] = useState([]);
  const [backTestBiggestGain, setBackTestBiggestGain] = useState();
  const [backTestBiggestLoss, setBackTestBiggestLoss] = useState();
  const [timeFrame, setTimeFrame] = useState("1d");
  const [resolution, setResolution] = useState();
  const [isMarketsMenuOpen, setIsMarketsMenuOpen] = useState(false);
  const [
    backTestNumberProfitTrades,
    setBackTestNumberProfitTrades,
  ] = useState();
  const [backTestNumberLossTrades, setBackTestNumberLossTrades] = useState();
  const [focusedDataItem, setFocusedDataItem] = useState({});
  const [isInfoPanelVisible, setIsInfoPanelVisible] = useState(false);
  const [isBackTestPanelVisible, setIsBackTestPanelVisible] = useState(false);
  const [marketData, setMarketData] = useState([]);
  const [dailyMarketData, setDailyMarketData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedMarketData, setCalculatedMarketData] = useState([]);
  const [error, setError] = useState("");

  let { marketId } = useParams();
  const splitMarketId = marketId.split("_");
  const baseCoin = splitMarketId[0];
  const coinMarket = splitMarketId[1].toLowerCase();
  const marketSymbol = coinMarket === "perp" ? "-" : "/";
  const apiMarketId = baseCoin + marketSymbol + coinMarket;
  const [trends, setTrends] = useState([
    {
      type: "LINE",
      selected: false,
      start: [110, 41329.107142857145],
      end: [158, 48078.66071428571],
      appearance: {
        edgeFill: "#FFFFFF",
        edgeStroke: "#000000",
        edgeStrokeWidth: 1,
        r: 6,
        strokeDasharray: "Solid",
        strokeStyle: "#000000",
        strokeWidth: 1,
      },
    },
    {
      type: "LINE",
      selected: false,
      // Size of x axies is from 0 to number of data points.
      start: [0, 41329.107142857145],
      end: [168, 48078.66071428571],
      appearance: {
        edgeFill: "#FFFFFF",
        edgeStroke: "#000000",
        edgeStrokeWidth: 1,
        r: 6,
        strokeDasharray: "Solid",
        strokeStyle: "#000000",
        strokeWidth: 1,
      },
    },
  ]);

  const getHistoricalPrices = useCallback(
    async (marketId, resolution, startTime, endTime) => {
      const fetchData = async (marketId, resolution, startTime, endTime) => {
        const response = await ftxapi.getHistoricalPrices(
          marketId,
          resolution,
          startTime,
          endTime
        );
        const data = response.data.result;

        // XXXXXXXX
        // XXX Move pagination stuff elsewhere!!!!!
        // XXXXXXXX
        // XXX This still needs testing!!!! Make sure we aren't re-adding the last
        // item.
        // if (
        //   data[data.length - 1].time <
        //   new Date().getTime() - toMilliseconds(1, 'hours')
        // ) {
        //   data.push(
        //     await fetchData(marketId, resolution, data[data.length - 1].time),
        //   );
        // }

        return data;
      };
      console.log("start time", startTime);
      try {
        const data = await fetchData(
          marketId,
          resolution,
          // Need to take an hour off start time so we get the candle that
          // the startTime value is a part of.
          startTime - toMilliseconds(1, "hours"),
          endTime
        );

        const dailyData = await fetchData(
          marketId,
          toSeconds(1, "days"),
          // Need to take an hour off start time so we get the candle that
          // the startTime value is a part of.
          startTime - toMilliseconds(1, "hours"),
          endTime
        );

        setIsLoading(false);
        console.log("RAW DATA", data);
        setMarketData(data);
        setDailyMarketData(dailyData);
      } catch (error) {
        setError(error.message);
      }
    },
    []
  );

  useEffect(() => {
    let newRes;

    if (timeFrame === "1w") {
      newRes = toSeconds(1, "weeks");
    } else if (timeFrame === "1d") {
      newRes = toSeconds(1, "days");
    } else if (timeFrame === "4h") {
      newRes = toSeconds(4, "hours");
    } else if (timeFrame === "1h") {
      newRes = toSeconds(1, "hours");
    } else if (timeFrame === "15m") {
      newRes = toSeconds(15, "minutes");
    } else if (timeFrame === "5m") {
      newRes = toSeconds(5, "minutes");
    }

    setResolution(newRes);
  }, [timeFrame]);

  useEffect(() => {
    setIsLoading(true);
    getHistoricalPrices(apiMarketId, resolution, startTime);
  }, [getHistoricalPrices, apiMarketId, resolution]);

  useEffect(() => {
    let calculatedData = swingLow(
      swingHigh(
        calcDataArrayPP(
          vwapCross(
            calcDataArrayVWAP(
              calcDataArrayMA(
                calcDataArrayMA(
                  calcDataArrayMA(
                    stochasticCross(
                      emaCross(
                        fullSTO(
                          rsiCalculator(
                            calcDataArrayMomentum(
                              calcDataArrayMomentum(
                                emaLong(
                                  // calcDataArrayDirectionExtremes(
                                  calcDataArraySmooth(
                                    // calcDataArraySmoothAvg(
                                    emaDouble(emaShort(marketData)),
                                    //   period / 2,
                                    //   ['high', 'low'],
                                    //   'smoothAvg',
                                    // ),
                                    period / 2,
                                    "close",
                                    "smooth"
                                  )
                                  //   10,
                                  //   '',
                                  //   'high',
                                  //   'low',
                                  //   // 'smooth',
                                  //   'smoothDirectionExtremes',
                                  // ),
                                ),
                                period / 2,
                                "smooth", // USE smooth OR emaDouble
                                "momentum1"
                              ),
                              period / 2,
                              "momentum1",
                              "momentum2"
                            )
                          )
                        ),
                        "emaShort",
                        "emaLong"
                      ),
                      "fullSTO",
                      "fullSTO"
                    ),
                    20,
                    "close",
                    "ma20"
                  ),
                  100,
                  "close",
                  "ma100"
                ),
                200,
                "close",
                "ma200"
              ),
              "volume",
              "close"
            ),
            "vwap"
          ),
          dailyMarketData,
          toMilliseconds(1, "days"),
          "pp"
        )
      )
    );

    console.log("DATA", calculatedData);

    const { minima, maxima } = findDataArrayMinimaMaxima(
      calculatedData,
      "momentum1",
      "momentum2"
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
      "lowHighsWithStrength",
      combineLowsAndHighs,
      lowHighsWithStrength
    );

    const linesToSave = [];

    lowHighsWithStrength.forEach((level) => {
      // const yPos = level.avgLine ? level.avgLine : level.value;
      const yPos = level.value;
      // if(level.numNear < 1) return;
      linesToSave.push(
        {
          // type: level.numNear > 6 ? 'RAY' : 'LINE',
          type: "LINE",
          selected: false,
          // Size of x axies is from 0 to number of data points.
          start: [level.index, yPos],
          end: [level.index + 10, yPos],
          appearance: {
            edgeFill: "#FFFFFF",
            edgeStroke: "#000000",
            edgeStrokeWidth: 1,
            r: 6,
            strokeDasharray: "Solid",
            strokeStyle:
              level.numNear < 1
                ? "#DDDDDD"
                : level.numNear > 6
                ? level.numNear > 16
                  ? "#000000"
                  : "#888888"
                : "#AAAAAA",
            strokeWidth: 3,
          },
        }
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

    setCalculatedMarketData(calculatedData);

    const range = 10;
    const levels = calcTrendLines(marketData, range);
    const chartRays = [];

    // Show range lines
    // for (let index = 0; index < marketData.length; index = index + range) {
    //   chartRays.push({
    //     type: 'RAY',
    //     selected: false,
    //     // Size of x axies is from 0 to number of data points.
    //     start: [index, 0],
    //     end: [index, 10],
    //     appearance: {
    //       edgeFill: '#FFFFFF',
    //       edgeStroke: '#000000',
    //       edgeStrokeWidth: 1,
    //       r: 6,
    //       strokeDasharray: 'Solid',
    //       strokeStyle: theme.colors.black,
    //       strokeWidth: 1,
    //     },
    //   });
    // }

    if (levels.length > 0) {
      let strengthMin = calcLevelStrength(levels[0], marketData);
      let strengthMax = calcLevelStrength(levels[0], marketData);

      levels.forEach((level) => {
        const strength = calcLevelStrength(level, marketData);

        if (strength > strengthMax) {
          strengthMax = strength;
        }
        if (strength < strengthMin) {
          strengthMin = strength;
        }
      });

      levels.forEach((level) => {
        const strength = calcLevelStrength(level, marketData);

        const filterVal = 0; // Remove the absolute least strong lines.
        const normalisedStrength = strength + levels[0].strength - strengthMin;
        const normalisedStrengthMax =
          strengthMax + levels[0].strength - strengthMin;

        if (normalisedStrength / normalisedStrengthMax < filterVal) {
          return;
        }

        const strengthDisplayVal = Math.floor(
          ((strength - strengthMin) / (strengthMax - strengthMin)) * 10
        );

        console.log(
          "Strength min/max",
          strength,
          strengthMin,
          strengthMax,
          strengthDisplayVal
        );

        chartRays.push({
          type: "RAY",
          selected: false,
          // Size of x axies is from 0 to number of data points.
          start: [level.points[0].x, level.y],
          end: [marketData.length, level.y],
          appearance: {
            edgeFill: "#FFFFFF",
            edgeStroke: "#000000",
            edgeStrokeWidth: 1,
            r: 6,
            strokeDasharray: "Solid",
            strokeStyle: theme.colors.chart.strength[strengthDisplayVal],
            strokeWidth: 1,
          },
        });

        level.points.forEach((point) => {
          chartRays.push({
            type: "LINE",
            selected: false,
            // Size of x axies is from 0 to number of data points.
            start: [point.x, point.y],
            end: [point.x + 1, point.y],
            appearance: {
              edgeFill: "#FFFFFF",
              edgeStroke: "#000000",
              edgeStrokeWidth: 1,
              r: 6,
              strokeDasharray: "Solid",
              strokeStyle: theme.colors.chart.strength[strengthDisplayVal],
              strokeWidth: 8,
            },
          });
        });
      });

      // const supports = findPivotSupports(marketData);
      const swings = [];
      calculatedData.forEach((current, index) => {
        if (current.indicators) {
          const swingHigh = current.indicators.find(
            (indicator) => indicator.id === "swingHigh"
          );
          const swingLow = current.indicators.find(
            (indicator) => indicator.id === "swingLow"
          );

          console.log(current, swingHigh, swingLow);

          if (swingHigh) {
            swings.push({
              type: "LINE",
              selected: false,
              start: [index, current.high],
              end: [index + 1, current.high],
              appearance: {
                edgeFill: "#FFFFFF",
                edgeStroke: "#AAFFAA",
                edgeStrokeWidth: 1,
                r: 6,
                strokeDasharray: "Solid",
                strokeStyle: "red",
                strokeWidth: 1,
              },
            });
          }
          if (swingLow) {
            swings.push({
              type: "LINE",
              selected: false,
              start: [index, current.low],
              end: [index + 1, current.low],
              appearance: {
                edgeFill: "#FFFFFF",
                edgeStroke: "#AAAAFF",
                edgeStrokeWidth: 1,
                r: 6,
                strokeDasharray: "Solid",
                strokeStyle: "#AAAAFF",
                strokeWidth: 1,
              },
            });
          }
        }
      });

      console.log("SWINGs", swings);

      setTrends([
        //...chartRays, ...linesToSave,
        ...swings,
      ]);
    }
  }, [marketData]);

  const handleRunBackTest = useCallback(async () => {
    // const events = backTestMarketDataWithStrategy(
    //   marketData,
    //   "emaCrossStrategy"
    //   // 'emaCrossRetraceToMaStrategy',
    // );
    const runBackTest = async () =>
      await backTestWithStrategy(
        apiMarketId,
        "emperorVwapStrategy",
        resolution,
        startTime
        // endTime
      );

    const events = await runBackTest();

    console.log("events", events);
    const profit = calcProfitFromEvents(events);
    console.log("PROFIT", profit);

    const backTestData = [...calculatedMarketData];
    // Get event index within market data array.
    const backtestEventsWithIndex = events.map((event) => {
      const dataIndex = calculatedMarketData.findIndex(
        (data) => data.time === event.time
      );

      return { ...event, index: dataIndex };
    });

    backtestEventsWithIndex.forEach((event, index) => {
      let profit = 0;
      if (
        event.type === "entry" &&
        backtestEventsWithIndex.length > index + 1
      ) {
        if (event.position === "long") {
          profit =
            backTestData[backtestEventsWithIndex[index + 1].index].close -
            backTestData[event.index].close;
        } else {
          profit =
            backTestData[event.index].close -
            backTestData[backtestEventsWithIndex[index + 1].index].close;
        }
      } else if (event.type === "exit") {
        if (event.position === "long") {
          profit =
            backTestData[event.index].close -
            backTestData[backtestEventsWithIndex[index - 1].index].close;
        } else {
          profit =
            backTestData[backtestEventsWithIndex[index - 1].index].close -
            backTestData[event.index].close;
        }
      }
      const eventData = {
        type: event.type,
        position: event.position,
        profit: profit,
      };

      if (!backTestData[event.index].backtestEvents) {
        backTestData[event.index].backtestEvents = [eventData];
      } else {
        backTestData[event.index].backtestEvents.push(eventData);
      }
    });

    setCalculatedMarketData(backTestData);
    setBackTestEvents(events);
    setBackTestResult(profit);
    setBackTestBiggestGain(profit.biggestGain);
    setBackTestBiggestLoss(profit.biggestLoss);
    setBackTestNumberProfitTrades(profit.numberProfitTrades);
    setBackTestNumberLossTrades(profit.numberLossTrades);
  }, [calculatedMarketData, resolution, marketId]);

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

  const handleOpenMarketsMenu = useCallback(() => {
    setIsMarketsMenuOpen((prevState) => !prevState);
  }, []);

  const handleChangeTimeFrame = useCallback((event) => {
    setTimeFrame(event.target.value);
  }, []);

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
      backTestBiggestLoss={backTestBiggestLoss && backTestBiggestLoss.value}
      backTestNumberProfitTrades={backTestNumberProfitTrades}
      backTestNumberLossTrades={backTestNumberLossTrades}
      numBackTestEntries={backTestEvents.reduce(
        (accumulator, currentValue) =>
          currentValue.type === "entry" ? accumulator + 1 : accumulator,
        0
      )}
      numBackTestExits={backTestEvents.reduce(
        (accumulator, currentValue) =>
          currentValue.type === "exit" ? accumulator + 1 : accumulator,
        0
      )}
      isBackTestPanelVisible={isBackTestPanelVisible}
      toggleBackTestPanel={toggleBackTestPanel}
      backTestResult={backTestResult}
      onRunBackTest={handleRunBackTest}
      onOpenMarketseMenu={handleOpenMarketsMenu}
      isMarketsMenuOpen={isMarketsMenuOpen}
      timeFrame={timeFrame}
      onChangeTimeFrame={handleChangeTimeFrame}
    />
  );
};

export default MarketContainer;
