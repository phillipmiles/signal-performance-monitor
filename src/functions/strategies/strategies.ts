// import { toMilliseconds, toSeconds } from '../util/time';
import { ema } from 'react-financial-charts';
import { emaCross } from '../indicators/emaCross';

const findEntry = (marketData) => {
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

  const calculatedData = emaCross(
    emaLong(emaShort(marketData)),
    'emaShort',
    'emaLong',
  );

  if (calculatedData.length > 0) {
    const latestData = calculatedData[calculatedData.length - 1];
    if (latestData.indicators !== undefined) {
      const emaCrossIndicator = latestData.indicators.find(
        (indicator) => indicator.id === 'ema-cross',
      );
      if (emaCrossIndicator) {
        return {
          price: latestData.close,
          position:
            emaCrossIndicator.data.type === 'bullish' ? 'long' : 'short',
          time: latestData.time,
          // stopLossPrice: 0.5,
        };
      }
    }
  }
  return;
};

const findInvalidation = (marketData, entry) => {
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

  const calculatedData = emaCross(
    emaLong(emaShort(marketData)),
    'emaShort',
    'emaLong',
  );

  if (calculatedData.length > 0) {
    const latestData = calculatedData[calculatedData.length - 1];
    if (latestData.indicators !== undefined) {
      console.log('calculatedData', calculatedData);
      const emaCrossIndicator = latestData.indicators.find(
        (indicator) => indicator.id === 'ema-cross',
      );
      if (emaCrossIndicator) {
        console.log('calculatedData', calculatedData);
        if (
          entry.position === 'long' &&
          emaCrossIndicator.data.type === 'bearish'
        ) {
          return {
            price: latestData.close,
            volume: 'all of it',
            time: latestData.time,
          };
        } else if (
          entry.position === 'short' &&
          emaCrossIndicator.data.type === 'bullish'
        ) {
          return {
            price: latestData.close,
            volume: 'all of it',
            time: latestData.time,
          };
        }
      }
    }
  }
  return;
};

const strategies = {
  emaCrossStrategy: {
    getMarketData: () => {},
    findEntry: findEntry,
    findTarget: (marketData) => {},
    findInvalidation: findInvalidation,
  },
};

export default strategies;
