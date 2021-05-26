// Designed to follow trends
// import { toMilliseconds, toSeconds } from '../util/time';
import { ema } from 'react-financial-charts';
import { emaCross } from '../indicators/emaCross';
import { calcDataArrayMA } from '../metrics/transformPriceData';

const findEntry = (marketData) => {
  const emaShort = ema()
    .id('short')
    .options({ windowSize: 9 })
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

  const calculatedData = calcDataArrayMA(
    calcDataArrayMA(
      emaCross(emaLong(emaShort(marketData)), 'emaShort', 'emaLong'),
      100,
      'close',
      'ma100',
    ),
    200,
    'close',
    'ma200',
  );

  // XXX Problem I won't be albeo to
  if (calculatedData.length > 1) {
    const current = calculatedData[calculatedData.length - 1];
    const previous = calculatedData[calculatedData.length - 2];

    if (previous.indicators !== undefined) {
      const emaCrossIndicator = previous.indicators.find(
        (indicator) => indicator.id === 'ema-cross',
      );
      if (emaCrossIndicator) {
        // Reject if MA100 hasn't been calculated.
        if (!current.ma100) {
          return;
        }

        // Reject when EMAs are between MAs.
        const averageEma = (current.emaShort + current.emaLong) / 2;
        if (
          (current.ma100 < averageEma && averageEma < current.ma200) ||
          (current.ma100 > averageEma && averageEma > current.ma200)
        ) {
          return;
        }

        // Reject if price between MAs.
        if (
          (current.ma100 < current.close && current.close < current.ma200) ||
          (current.ma100 > current.close && current.close > current.ma200)
        ) {
          return;
        }

        // Reject if price is really close to ma100 already.
        if (
          current.close > current.ma100 - current.ma100 * 0.025 &&
          current.close < current.ma100 + current.ma100 * 0.025
        ) {
          return;
        }

        // Reject if price is really close to ma200 already.
        if (
          current.close > current.ma200 - current.ma200 * 0.025 &&
          current.close < current.ma200 + current.ma200 * 0.025
        ) {
          return;
        }

        // Short
        if (emaCrossIndicator.data.type === 'bearish') {
          if (current.emaShort > current.ma100) {
            return {
              price: current.close,
              position: 'short',
              time: current.time,
            };
          }
          // Long
        } else if (emaCrossIndicator.data.type === 'bullish') {
          // Only take longs if ma100 slope is rising
          // if (current.ma100 - previous.ma100 < 0) {
          //   return;
          // }

          if (current.emaShort < current.ma100) {
            return {
              price: current.close,
              position: 'long',
              time: current.time,
            };
          }
        }
      }
    }
  }
  return;
};

const findInvalidation = (marketData, entry) => {
  const emaShort = ema()
    .id('short')
    .options({ windowSize: 9 })
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
  const calculatedData = calcDataArrayMA(
    calcDataArrayMA(
      emaCross(emaLong(emaShort(marketData)), 'emaShort', 'emaLong'),
      100,
      'close',
      'ma100',
    ),
    100,
    'close',
    'ma200',
  );

  if (calculatedData.length > 0) {
    const current = calculatedData[calculatedData.length - 1];
    const previous = calculatedData[calculatedData.length - 2];

    if (previous.indicators !== undefined) {
      const emaCrossIndicator = previous.indicators.find(
        (indicator) => indicator.id === 'ema-cross',
      );
      if (emaCrossIndicator) {
        if (
          entry.position === 'long' &&
          emaCrossIndicator.data.type === 'bearish'
        ) {
          return {
            price: current.close,
            position: entry.position,
            volume: 'all of it',
            time: current.time,
          };
        } else if (
          entry.position === 'short' &&
          emaCrossIndicator.data.type === 'bullish'
        ) {
          return {
            price: current.close,
            position: entry.position,
            volume: 'all of it',
            time: current.time,
          };
        }
      }
    }

    if (entry.position === 'long') {
      if (current.close < entry.price - entry.price * 0.05) {
        return {
          price: entry.price - entry.price * 0.05,
          position: entry.position,
          volume: 'all of it',
          time: current.time,
        };
      }
      if (current.high > current.ma100 - current.ma100 * 0.025) {
        return {
          price: current.ma100 - current.ma100 * 0.025,
          position: entry.position,
          volume: 'all of it',
          time: current.time,
        };
      }
      if (current.high > current.ma200 - current.ma200 * 0.025) {
        return {
          price: current.ma200 - current.ma200 * 0.025,
          position: entry.position,
          volume: 'all of it',
          time: current.time,
        };
      }
    } else if (entry.position === 'short') {
      if (current.close > entry.price + entry.price * 0.05) {
        return {
          price: entry.price + entry.price * 0.05,
          position: entry.position,
          volume: 'all of it',
          time: current.time,
        };
      }
      if (current.low < current.ma100 + current.ma100 * 0.025) {
        return {
          price: current.ma100 + current.ma100 * 0.025,
          position: entry.position,
          volume: 'all of it',
          time: current.time,
        };
      }
      if (current.low < current.ma200 + current.ma200 * 0.025) {
        return {
          price: current.ma200 + current.ma200 * 0.025,
          position: entry.position,
          volume: 'all of it',
          time: current.time,
        };
      }
    }
  }
  return;
};

export default {
  getMarketData: () => {},
  findEntry: findEntry,
  findTarget: (marketData) => {},
  findInvalidation: findInvalidation,
};
