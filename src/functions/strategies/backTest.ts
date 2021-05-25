import strategies from './strategies';

// interface Target {}

// interface Invalidation {}

export const backTestMarketDataWithStrategy = (marketData, stategyId) => {
  const events = [];
  const strategy = strategies[stategyId];

  marketData.forEach((data, index) => {
    if (events.length !== 0 && events[events.length - 1].type === 'entry') {
      // const target = strategy.findTarget(marketData);
      console.log('check inval');
      const invalidation = strategy.findInvalidation(
        marketData.slice(0, index),
        events[events.length - 1],
      );

      if (invalidation) {
        console.log('savingin inval');
        events.push({
          type: 'exit',
          price: invalidation.price,
          time: invalidation.time,
        });
      }
    }

    if (events.length === 0 || events[events.length - 1].type !== 'entry') {
      console.log('fin entry');
      const entry = strategy.findEntry(marketData.slice(0, index));
      if (entry) {
        console.log('saving entry');
        events.push({
          type: 'entry',
          price: entry.price,
          position: entry.position,
          time: entry.time,
          // stopLossPrice: entry.stopLossPrice,
        });
      }
    }
  });
  console.log('e', events);
  return events;
};

export const calcProfitFromEvents = (events) => {
  const initialQuantity = 1;
  let quantity = initialQuantity;
  let index = 0;
  let highestGain;
  let highestLoss;

  for (const event of events) {
    if (event.type === 'exit') {
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
        (corrispondingEntryEvent.position === 'long' ? 1 : -1);
      const quantityGain = percentageGain * quantity;
      quantity = quantity + quantityGain;

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
    roi: quantity - initialQuantity / initialQuantity,
    biggestGain: highestGain,
    biggestLoss: highestLoss,
  };
};

const backTestStrategy = (
  marketId: string,
  timeStart: number,
  timeEnd: number,
  strategyId: string,
  debug: boolean,
) => {
  const marketData = [];
  backTestMarketDataWithStrategy(marketData, strategyId);
  return;
};
