// Designed to follow trends
// import { toMilliseconds, toSeconds } from '../util/time';
import { ema, stochasticOscillator } from "react-financial-charts";
import { emaCross } from "../indicators/emaCross";
import { calcDataArrayMA } from "../metrics/transformPriceData";

const findEntry = (marketData) => {
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

  const fullSTO = stochasticOscillator()
    .options({ windowSize: 14, kWindowSize: 3, dWindowSize: 4 })
    .merge((d, c) => {
      d.fullSTO = c;
    })
    .accessor((d) => d.fullSTO);
  const calculatedData = fullSTO(
    calcDataArrayMA(
      calcDataArrayMA(
        emaCross(emaLong(emaShort(marketData)), "emaShort", "emaLong"),
        100,
        "close",
        "ma100"
      ),
      200,
      "close",
      "ma200"
    )
  );

  console.log("calculatedData", calculatedData);
  if (calculatedData.length > 1) {
    const current = calculatedData[calculatedData.length - 1];
    const previous = calculatedData[calculatedData.length - 2];

    if (current.indicators !== undefined) {
      const emaCrossIndicator = current.indicators.find(
        (indicator) => indicator.id === "ema-cross"
      );
      if (emaCrossIndicator) {
        // Reject if MA200 hasn't been calculated.
        if (!current.ma200) {
          return;
        }

        // Reject when EMAs are between MAs.
        // const averageEma = (current.emaShort + current.emaLong) / 2;
        // if (
        //   (current.ma100 < averageEma && averageEma < current.ma200) ||
        //   (current.ma100 > averageEma && averageEma > current.ma200)
        // ) {
        //   return;
        // }

        // Short
        if (emaCrossIndicator.data.type === "bearish") {
          // Only take shorts if ma100 slope is falling
          if (current.ma100 - previous.ma100 > 0) {
            return;
          }
          // if (
          //   latestData.ma200 > latestData.ma100 &&
          //   emaCrossIndicator.data.type === 'bearish'
          // ) {
          // if (latestData.close < latestData.ma100) {

          if (current.fullSTO.K < 20) {
            return;
          }

          return {
            price: current.close,
            position: "short",
            time: current.time,
            // stopLossPrice: 0.5,
          };
          // }
          // Long
        } else if (emaCrossIndicator.data.type === "bullish") {
          // Only take longs if ma100 slope is rising
          if (current.ma100 - previous.ma100 < 0) {
            return;
          }

          if (current.fullSTO.K > 80) {
            return;
          }

          // } else if (
          //   latestData.ma200 < latestData.ma100 &&
          //   emaCrossIndicator.data.type === 'bullish'
          // ) {
          // if (latestData.close > latestData.ma100) {
          return {
            price: current.close,
            position: "long",
            time: current.time,
            // stopLossPrice: 0.5,
          };
          // }
          // }
        }
      }
    }
  }
  return;
};

const findInvalidation = (marketData, entry) => {
  const emaShort = ema()
    .id("short")
    .options({ windowSize: 10 })
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

  const fullSTO = stochasticOscillator()
    .options({ windowSize: 14, kWindowSize: 3, dWindowSize: 4 })
    .merge((d, c) => {
      d.fullSTO = c;
    })
    .accessor((d) => d.fullSTO);

  const calculatedData = fullSTO(
    emaCross(emaLong(emaShort(marketData)), "emaShort", "emaLong")
  );

  if (calculatedData.length > 0) {
    const latestData = calculatedData[calculatedData.length - 1];

    // XXX TOFIX - Problem if entry ends up being before the proovided market data array then
    // we lose entry.
    const indexOfEntry = marketData.findIndex(
      (priceData) => priceData.time === entry.time
    );

    let didCrossOverBounds = false;

    if (
      entry.position === "long" &&
      calculatedData[indexOfEntry].fullSTO.K > 20 &&
      latestData.fullSTO.K <= 20
    ) {
      return {
        price: latestData.close,
        position: entry.position,
        volume: "all of it",
        time: latestData.time,
      };
    } else if (
      entry.position === "short" &&
      calculatedData[indexOfEntry].fullSTO.K < 80 &&
      latestData.fullSTO.K >= 80
    ) {
      return {
        price: latestData.close,
        position: entry.position,
        volume: "all of it",
        time: latestData.time,
      };
    }

    for (let index = indexOfEntry; index < marketData.length; index++) {
      // console.log(entry.position, calculatedData[index].fullSTO.D);
      if (entry.position === "long" && calculatedData[index].fullSTO.K >= 80) {
        // console.log('did cross', entry.position, calculatedData[index]);
        didCrossOverBounds = true;
      } else if (
        entry.position === "short" &&
        calculatedData[index].fullSTO.K <= 20
      ) {
        // console.log('did cross', entry.position, calculatedData[index]);
        didCrossOverBounds = true;
      }

      if (
        entry.position === "long" &&
        calculatedData[index].fullSTO.K < 80 &&
        didCrossOverBounds
      ) {
        return {
          price: latestData.close,
          position: entry.position,
          volume: "all of it",
          time: latestData.time,
        };
      } else if (
        entry.position === "short" &&
        calculatedData[index].fullSTO.K > 20 &&
        didCrossOverBounds
      ) {
        return {
          price: latestData.close,
          position: entry.position,
          volume: "all of it",
          time: latestData.time,
        };
      }
    }

    // console.log('indexOFEnty', indexOfEntry);

    // if (latestData.indicators !== undefined) {
    //   const emaCrossIndicator = latestData.indicators.find(
    //     (indicator) => indicator.id === 'ema-cross',
    //   );
    //   if (emaCrossIndicator) {
    //     if (
    //       entry.position === 'long' &&
    //       emaCrossIndicator.data.type === 'bearish'
    //     ) {
    //       return {
    //         price: latestData.close,
    //         position: entry.position,
    //         volume: 'all of it',
    //         time: latestData.time,
    //       };
    //     } else if (
    //       entry.position === 'short' &&
    //       emaCrossIndicator.data.type === 'bullish'
    //     ) {
    //       return {
    //         price: latestData.close,
    //         position: entry.position,
    //         volume: 'all of it',
    //         time: latestData.time,
    //       };
    //     }
    //   }
    // }
  }
  return;
};

export default {
  getMarketData: () => {},
  findEntry: findEntry,
  findTarget: (marketData) => {},
  findInvalidation: findInvalidation,
};
