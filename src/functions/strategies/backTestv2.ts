import { toMilliseconds } from "../../util/time";
import strategies from "./strategies";

// interface Target {}

// interface Invalidation {}
const sliceMarketDataArray = (marketData, endTime) => {
  const endIndex = marketData.findIndex((item) => item.time > endTime);
  if (endIndex === -1) {
    return marketData;
  } else {
    return marketData.slice(0, endIndex);
  }
};

export const backTestWithStrategy = async (
  marketId,
  stategyId,
  resolution,
  startTime,
  endTime
) => {
  const events = [];
  const strategy = strategies[stategyId];
  console.log(stategyId, strategy);

  const marketData = await strategy.getBacktestMarketData(
    marketId,
    resolution,
    startTime,
    endTime
  );

  console.log("MARKET DATA", marketData);

  marketData.resolution.forEach((data, index) => {
    const slicedResolutionMarketData = sliceMarketDataArray(
      marketData.resolution,
      data.time
    );
    const slicedDailyMarketData = sliceMarketDataArray(
      marketData.daily,
      data.time
    );

    const slicedMarketData = {
      resolution: slicedResolutionMarketData,
      dailyMarketData: slicedDailyMarketData,
    };

    console.log("slicedMarketData", slicedMarketData);

    if (events.length !== 0 && events[events.length - 1].type === "entry") {
      // const target = strategy.findTarget(marketData);
      const invalidation = strategy.findInvalidation(
        slicedMarketData,
        events[events.length - 1]
      );

      if (invalidation) {
        events.push({
          type: "exit",
          position: invalidation.position,
          price: invalidation.price,
          time: invalidation.time,
        });
      }
    }

    if (events.length === 0 || events[events.length - 1].type !== "entry") {
      const entry = strategy.findEntry(slicedMarketData);
      if (entry) {
        events.push({
          type: "entry",
          position: entry.position,
          price: entry.price,
          time: entry.time,
          // stopLossPrice: entry.stopLossPrice,
        });
      }
    }
  });
  return events;
};

export const calcProfitFromEvents = (events) => {
  const initialQuantity = 1;
  let quantity = initialQuantity;
  let index = 0;
  let highestGain;
  let highestLoss;
  let numProfitTrades = 0;
  let numLossTrades = 0;
  let totalPercentageGained = 0;
  let totalPercentageLossed = 0;
  let profit = 0;

  for (const event of events) {
    if (event.type === "exit") {
      const corrispondingEntryEvent = events[index - 1];
      // console.log(
      //   corrispondingEntryEvent.position,
      //   corrispondingEntryEvent.price,
      //   event.price,
      // );
      const percentageMoveInPrice =
        (event.price - corrispondingEntryEvent.price) /
        corrispondingEntryEvent.price;

      const percentageGain =
        percentageMoveInPrice *
        (corrispondingEntryEvent.position === "long" ? 1 : -1);

      profit = profit + percentageGain;
      const quantityGain = percentageGain * quantity;
      quantity = quantity + quantityGain;

      if (percentageGain > 0) {
        numProfitTrades = numProfitTrades + 1;
        totalPercentageGained = totalPercentageGained + percentageGain;
      }

      if (percentageGain < 0) {
        numLossTrades = numLossTrades + 1;
        totalPercentageLossed = totalPercentageLossed + percentageGain;
      }

      if (!highestGain || highestGain.value < percentageGain) {
        highestGain = {
          value: percentageGain,
          entryEvent: corrispondingEntryEvent,
          exitEvent: event,
        };
      }

      if (!highestLoss || highestLoss.value > percentageGain) {
        highestLoss = {
          value: percentageGain,
          entryEvent: corrispondingEntryEvent,
          exitEvent: event,
        };
      }
    }
    // Run out of money

    if (quantity <= 0) {
      quantity = 0;
      break;
    }
    index = index + 1;
  }

  return {
    profit: profit,
    compoundProfit: quantity - initialQuantity / initialQuantity,
    totalPercentageGained: totalPercentageGained,
    totalPercentageLossed: totalPercentageLossed,
    biggestGain: highestGain,
    biggestLoss: highestLoss,
    numberLossTrades: numLossTrades,
    numberProfitTrades: numProfitTrades,
  };
};

const backTestStrategy = (
  marketId: string,
  timeStart: number,
  timeEnd: number,
  strategyId: string,
  debug: boolean
) => {
  const marketData = [];
  backTestMarketDataWithStrategy(marketData, strategyId);
  return;
};
