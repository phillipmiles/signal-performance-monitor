import { toMilliseconds } from "../../util/time";
import { calculateMA } from "../metrics/ma";

const calcTypicalPrice = (high, low, close) => (high + low + close) / 3;

// Adds smoothened value to a market price data array by averaging a price in time by the
// neighbouring price points where number of neighbouring points used either side of a price
// is dictated by the 'smoothFactor'. A larger smoothFactor = more points used in averaging
// and so flatter returned price data.
//
// Key defines which value to use in the market price data and id (optional) is used for the
// key where the smoothened value is store in returning market data array.
export const calcDataArraySmooth = (
  dataArray: any[],
  smoothFactor: number,
  key: string,
  id?: string
): any[] => {
  return dataArray.map((priceData, i) => {
    if (i < smoothFactor || i > dataArray.length - 1 - smoothFactor)
      return { ...priceData };
    let sum = 0;
    let loopedIndex;
    for (
      loopedIndex = i - smoothFactor;
      loopedIndex <= i + smoothFactor;
      loopedIndex++
    ) {
      sum = sum + dataArray[loopedIndex][key];
    }

    // const smoothed = sum / (smoothFactor * 2 + 1);
    const smoothed = sum / (smoothFactor * 2 + 1);

    return { ...priceData, [id ? id : "smooth"]: smoothed };
  });
};

export const calcDataArraySmoothAvg = (
  dataArray: any[],
  smoothFactor: number,
  keys: string[],
  id?: string
): any[] => {
  return dataArray.map((priceData, i) => {
    if (i < smoothFactor || i > dataArray.length - smoothFactor)
      return { ...priceData };
    let sum = 0;
    let loopedIndex;
    for (
      loopedIndex = i - smoothFactor;
      loopedIndex < i + smoothFactor;
      loopedIndex++
    ) {
      let sumKeys = 0;
      keys.forEach((key) => {
        sumKeys = sumKeys + dataArray[loopedIndex][key];
      });
      sum = sum + sumKeys / keys.length;
    }

    const smoothed = sum / (smoothFactor * 2 + 1);

    return { ...priceData, [id ? id : "smoothAvg"]: smoothed };
  });
};

export const calcDataArrayDirectionExtremes = (
  dataArray: any[],
  smoothFactor: number,
  smoothKey: string,
  upKey: string,
  downKey: string,
  id?: string
): any[] => {
  const newDataArray = [];
  dataArray.forEach((priceData, i) => {
    if (i > dataArray.length - 1) return { ...priceData };

    if (i < smoothFactor || i > dataArray.length - smoothFactor)
      return { ...priceData };
    let sum = 0;
    let loopedIndex;

    for (
      loopedIndex = i - smoothFactor;
      loopedIndex < i + smoothFactor;
      loopedIndex++
    ) {
      if (priceData["close"] > priceData["open"]) {
        // sum = sum + priceData[upKey];
        sum = sum + dataArray[loopedIndex][upKey];
      } else {
        // sum = sum + priceData[downKey];
        sum = sum + dataArray[loopedIndex][downKey];
      }
    }

    // if (
    //   newDataArray.length > 0 &&
    //   priceData[upKey] >= newDataArray[i - 1][upKey]
    // ) {
    //   sum = sum + priceData[upKey];
    // } else {
    //   sum = sum + priceData[downKey];
    // }

    // XXX

    // if (priceData[smoothKey] - dataArray[loopedIndex - 1][smoothKey] >= 0) {
    //   sum = sum + priceData[upKey];
    // } else {
    //   sum = sum + priceData[downKey];
    // }
    // }

    const smoothed = sum / (smoothFactor * 2 + 1);

    newDataArray.push({
      ...priceData,
      [id ? id : "smoothDirectionExtremes"]: smoothed,
    });
  });
  return newDataArray;
};

// Calculates an array of data's momemtum for each element in the array by observing the
// change in a value from each element and the element [period] indices ago.
export const calcDataArrayMomentum = (
  dataArray: any[],
  period: number,
  key: string,
  id?: string
): any[] => {
  return dataArray.map((data, i) => {
    if (i < period || !data[key]) return data;

    // const momentum = (data[key] / array[i - factor][key]) * 100;
    const momentum = data[key] - dataArray[i - period][key];

    return { ...data, [id ? id : "momentum"]: momentum };
  });
};

export const calcMomentum = (array, period) => {
  return array.map((val, i) => {
    if (i < period || array[i - period] === null) return null;

    return val - array[i - period];
  });
};

export const calcDataArrayMA = (
  dataArray: any[],
  period: number,
  key: string,
  id?: string
): any[] => {
  return dataArray.map((priceData, i) => {
    if (i < period || !priceData[key]) return priceData;

    const observableData = dataArray.slice(i - period, i);
    const total = observableData.reduce(
      (total: number, item) => total + item[key],
      0
    );

    const ma = total / observableData.length;

    return { ...priceData, [id ? id : "ma"]: ma };
  });
};

// Calculates vwap as per https://academy.binance.com/en/articles/volume-weighted-average-price-vwap-explained
export const calcDataArrayVWAP = (
  dataArray: any[],
  volumeKey: string,
  priceKey: string,
  id?: string
): any[] => {
  const newDataArray = [];

  let sumN1 = 0;
  let sumVolume = 0;

  dataArray.forEach((priceData, i) => {
    const { high, low, close, volume, time } = priceData;

    const dateTime = new Date(time);
    const typicalPrice = calcTypicalPrice(high, low, close);

    const n1 = typicalPrice * volume;

    // Reset sum numbers at the start of each day.
    if (dateTime.getUTCHours() === 0 && dateTime.getUTCMinutes() === 0) {
      sumN1 = n1;
      sumVolume = volume;
    } else {
      sumN1 = sumN1 + n1;
      sumVolume = sumVolume + volume;
    }

    const vwap = sumN1 / sumVolume;

    newDataArray.push({
      ...priceData,
      [id ? id : "vwap"]: vwap,
    });
  });
  return newDataArray;
};

// Calculates standard pivot point using https://www.daytrading.com/pivot-points
// Support resistance calculated using fibonnaci found here... https://www.babypips.com/learn/forex/other-pivot-point-calculation-methods
export const calcDataArrayPP = (
  dataArray: any[],
  dailyDataArray: any[],
  res: number,
  id?: string
): any[] => {
  if (
    !dataArray ||
    !dataArray[dataArray.length - 1] ||
    !dailyDataArray ||
    dailyDataArray.length <= 0
  )
    return dataArray;

  // If resolution matches or is smaller then the resolution of the data array then abort.
  // Can only calculate with a resolution smaller then that of the dataArrays.
  if (
    res <=
    dataArray[dataArray.length - 1].time - dataArray[dataArray.length - 2].time
  ) {
    return dataArray;
  }

  return dataArray.map((priceData, i) => {
    const yesterdaysData = dailyDataArray.find((dayData) => {
      const yesterdaysTime = priceData.time - res;
      if (
        yesterdaysTime >= dayData.time &&
        yesterdaysTime < dayData.time + res
      ) {
        return dayData;
      }
    });

    if (!yesterdaysData) return priceData;

    const { high, low, close } = yesterdaysData;
    const pp = calcTypicalPrice(high, low, close);

    // Fibonacci
    const r1 = pp + (high - low) * 0.382;
    const r2 = pp + (high - low) * 0.618;
    const r3 = pp + (high - low) * 1;
    const s1 = pp - (high - low) * 0.382;
    const s2 = pp - (high - low) * 0.618;
    const s3 = pp - (high - low) * 1;

    return { ...priceData, [id ? id : "pp"]: pp, r1, r2, r3, s1, s2, s3 };
  });
};
