import { stochasticOscillator } from "react-financial-charts";
import {
  calcDataArrayVWAP,
  calcDataArrayPP,
} from "../metrics/transformPriceData";
import { stochasticCross } from "../indicators/stochasticCross";
import { vwapCross } from "../indicators/vwapCross";
import { swingHigh, swingLow } from "../indicators/swing";
import { toMilliseconds, toSeconds } from "../../util/time";
import ftxapi from "../../api/ftx/api";

// Enter made on very next candle after all three requirements filled only when price is higher has
// moved higher then the previous candle.

const prepareMarketData = (marketData, dailyMarketData) => {
  const fullSTO = stochasticOscillator()
    .options({ windowSize: 14, kWindowSize: 3, dWindowSize: 4 })
    .merge((d, c) => {
      d.fullSTO = c;
    })
    .accessor((d) => d.fullSTO);

  return calcDataArrayPP(
    vwapCross(
      calcDataArrayVWAP(
        stochasticCross(fullSTO(marketData), "fullSTO", "fullSTO"),
        "volume",
        "close"
      ),
      "vwap"
    ),
    dailyMarketData,
    toMilliseconds(1, "days"),
    "pp"
  );
};

const fetchMarketData = async (marketId, resolution, startTime, endTime) => {
  const response = await ftxapi.getHistoricalPrices(
    marketId,
    resolution,
    // Need to take an hour off start time so we get the candle that
    // the startTime value is a part of.
    // XXX ERRR does this work for other resolutions like 15minutes????
    startTime - toMilliseconds(1, "hours"),
    endTime
  );

  return response.data.result;
};

const getBacktestMarketData = async (
  marketId,
  resolution,
  startTime,
  endTime
) => {
  const marketData = await fetchMarketData(
    marketId,
    resolution,
    startTime,
    endTime
  );

  const dailyMarketData = await fetchMarketData(
    marketId,
    toSeconds(1, "days"),
    startTime,
    endTime
  );

  return {
    resolution: marketData,
    daily: dailyMarketData,
  };
};

const findEntry = (marketData) => {
  const NUM_DATA_TO_OBSERVE = 2;
  const preparedMarketData = prepareMarketData(
    marketData.resolution,
    marketData.daily
  );

  const current = preparedMarketData[preparedMarketData.length - 1];

  // Has crossed pivot line
  const hasCrossedPivotLine = false;

  // Make sure it had touched pivot line
  // Donm'ty short if contacted resistance (pivot line) below price.
  // Maybe don;t sell unless price moves all the way back to triggering pivot price.
  // OR price returns to a swing point that gets established.
  // Do a Risk management analysis on strategy. Maybe same risk analysis for all
  // strategy. Compare output risk value to strategies individual indicator strength
  // value. How promising the indicators look.
  // If no swing has been established then used MACD cross (confirmed, not a tickle) or
  // Stochastic cross.

  let stochasticCrossType;
  let stochasticCrossIndex;
  let vwapCrossType;
  let vwapCrossIndex;
  let expandingVolumeIndex;
  // Index that criteria is met and from which point we need to wait for price
  // movement to confirm outlook.
  let criteriaMetIndex;

  const recentMarketData = [...preparedMarketData].splice(
    preparedMarketData.length - NUM_DATA_TO_OBSERVE
  );

  // - Need to improve volume expansion. It picks up shitty expansions that are really small
  // and meaningless.
  // - Need to check candle patterns
  // - Might need to further confirm/check that a pivot point is actually acting
  // as a support / resistance.
  // - Do a different strategy that is basically an indicator overkill, only acts
  // when all the indicators say the same thing.
  recentMarketData.forEach((item, index) => {
    if (item.indicators) {
      const vwapIndicator = item.indicators.find(
        (indicator) => indicator.id === "vwap-cross"
      );
      const stochasticIndicator = item.indicators.find(
        (indicator) => indicator.id === "stochastic-cross"
      );

      console.log(vwapIndicator, stochasticIndicator);

      if (vwapIndicator) {
        vwapCrossType = vwapIndicator.data.type;
        vwapCrossIndex = index;
      }

      if (stochasticIndicator) {
        stochasticCrossType = stochasticIndicator.data.type;
        stochasticCrossIndex = index;
      }

      // if (item.pp) {
      //   hasCrossedPivotLine = true;
      // }
      console.log(
        preparedMarketData,
        preparedMarketData.length - NUM_DATA_TO_OBSERVE + index - 1
      );
      if (
        preparedMarketData.length > NUM_DATA_TO_OBSERVE &&
        item.volume >
          preparedMarketData[
            preparedMarketData.length - NUM_DATA_TO_OBSERVE + index - 1
          ].volume
      ) {
        console.log("EXAPNDING VOLULME", index);
        expandingVolumeIndex = index;
      }
    }
  });

  if (stochasticCrossType && vwapCrossType) {
    criteriaMetIndex = Math.max(vwapCrossIndex, stochasticCrossIndex);
  }

  if (stochasticCrossType && vwapCrossType) {
    // If current is same candle as the candle that all critira was first met
    // then skip it. Need to wait for next candle to observe confirmation
    // of price movement.
    if (criteriaMetIndex !== NUM_DATA_TO_OBSERVE - 1) {
      // Check that previous candle had expanding volume.
      console.log("HIUGIKWENG", expandingVolumeIndex, NUM_DATA_TO_OBSERVE - 2);
      if (expandingVolumeIndex === NUM_DATA_TO_OBSERVE - 2) {
        // Find index of criteria
        let positionType;
        let entryPrice;

        if (stochasticCrossType === "bullish" && vwapCrossType === "bullish") {
          if (
            current.high >
            preparedMarketData[preparedMarketData.length - 2].high
          ) {
            positionType = "long";
            entryPrice = preparedMarketData[preparedMarketData.length - 2].high;
          }
        } else if (
          stochasticCrossType === "bearish" &&
          vwapCrossType === "bearish"
        ) {
          if (
            current.low < preparedMarketData[preparedMarketData.length - 2].low
          ) {
            positionType = "short";
            entryPrice = preparedMarketData[preparedMarketData.length - 2].low;
          }
        }

        if (positionType) {
          return {
            price: entryPrice,
            position: positionType,
            time: current.time,
            // stopLossPrice: 0.5,
          };
        }
      }
    }
  }

  // console.log("calculatedData", calculatedData);
  // if (calculatedData.length > 1) {
  //   const current = calculatedData[calculatedData.length - 1];
  //   const previous = calculatedData[calculatedData.length - 2];

  //   if (current.indicators !== undefined) {
  //     const emaCrossIndicator = current.indicators.find(
  //       (indicator) => indicator.id === "ema-cross"
  //     );
  //     if (emaCrossIndicator) {
  //       // Reject if MA200 hasn't been calculated.
  //       if (!current.ma200) {
  //         return;
  //       }

  //       // Reject when EMAs are between MAs.
  //       // const averageEma = (current.emaShort + current.emaLong) / 2;
  //       // if (
  //       //   (current.ma100 < averageEma && averageEma < current.ma200) ||
  //       //   (current.ma100 > averageEma && averageEma > current.ma200)
  //       // ) {
  //       //   return;
  //       // }

  //       // Short
  //       if (emaCrossIndicator.data.type === "bearish") {
  //         // Only take shorts if ma100 slope is falling
  //         if (current.ma100 - previous.ma100 > 0) {
  //           return;
  //         }
  //         // if (
  //         //   latestData.ma200 > latestData.ma100 &&
  //         //   emaCrossIndicator.data.type === 'bearish'
  //         // ) {
  //         // if (latestData.close < latestData.ma100) {

  //         if (current.fullSTO.K < 20) {
  //           return;
  //         }

  //         return {
  //           price: current.close,
  //           position: "short",
  //           time: current.time,
  //           // stopLossPrice: 0.5,
  //         };
  //         // }
  //         // Long
  //       } else if (emaCrossIndicator.data.type === "bullish") {
  //         // Only take longs if ma100 slope is rising
  //         if (current.ma100 - previous.ma100 < 0) {
  //           return;
  //         }

  //         if (current.fullSTO.K > 80) {
  //           return;
  //         }

  //         // } else if (
  //         //   latestData.ma200 < latestData.ma100 &&
  //         //   emaCrossIndicator.data.type === 'bullish'
  //         // ) {
  //         // if (latestData.close > latestData.ma100) {
  //         return {
  //           price: current.close,
  //           position: "long",
  //           time: current.time,
  //           // stopLossPrice: 0.5,
  //         };
  //         // }
  //         // }
  //       }
  //     }
  //   }
  // }
  return;
};

export function findLastIndex<T>(
  array: Array<T>,
  predicate: (value: T, index: number, obj: T[]) => boolean
): number {
  let l = array.length;
  while (l--) {
    if (predicate(array[l], l, array)) return l;
  }
  return -1;
}

const findInvalidation = (marketData, entry) => {
  const preparedMarketData = swingLow(
    swingHigh(prepareMarketData(marketData.resolution, marketData.daily))
  );

  const current = preparedMarketData[preparedMarketData.length - 1];

  // const swingLowIndex = preparedMarketData
  //   .slice()
  //   .reverse()
  //   .findIndex(
  //     (item) =>
  //       item.indicators &&
  //       item.indicators.find((indicator) => indicator.id === "swingLow")
  //   );

  const swingLowIndex = findLastIndex(
    preparedMarketData,
    (item) =>
      item.indicators &&
      item.indicators.find((indicator) => indicator.id === "swingLow")
  );

  const swingHighIndex = findLastIndex(
    preparedMarketData,
    (item) =>
      item.indicators &&
      item.indicators.find((indicator) => indicator.id === "swingHigh")
  );

  if (entry.position === "short") {
    if (current.high >= preparedMarketData[swingHighIndex].high) {
      console.log(
        "entry",
        entry,
        swingHighIndex,
        preparedMarketData[swingHighIndex]
      );
      return {
        price: preparedMarketData[swingHighIndex].high,
        position: entry.position,
        volume: "all of it",
        time: current.time,
      };
    }
  } else if (entry.position === "long") {
    if (current.low <= preparedMarketData[swingLowIndex].low) {
      return {
        price: preparedMarketData[swingLowIndex].low,
        position: entry.position,
        volume: "all of it",
        time: current.time,
      };
    }
  }

  // if (current.indicators) {
  //   const stochasticIndicator = current.indicators.find(
  //     (indicator) => indicator.id === "stochastic-cross"
  //   );

  //   // if (stochasticIndicator) {

  //   // }
  //   if (entry.position === "long") {
  //     if (stochasticIndicator) {
  //       if (stochasticIndicator.data.type === "bearish") {
  //         return {
  //           price: current.close,
  //           position: entry.position,
  //           volume: "all of it",
  //           time: current.time,
  //         };
  //       }
  //     }
  //   }
  // }
};

export default {
  getMarketData: () => {},
  getBacktestMarketData: getBacktestMarketData,
  findEntry: findEntry,
  findTarget: (marketData) => {},
  findInvalidation: findInvalidation,
};
