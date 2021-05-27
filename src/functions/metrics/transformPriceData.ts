import { calculateMA } from '../metrics/ma';

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
  id?: string,
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

    return { ...priceData, [id ? id : 'smooth']: smoothed };
  });
};

export const calcDataArraySmoothAvg = (
  dataArray: any[],
  smoothFactor: number,
  keys: string[],
  id?: string,
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

    return { ...priceData, [id ? id : 'smoothAvg']: smoothed };
  });
};

export const calcDataArrayDirectionExtremes = (
  dataArray: any[],
  smoothFactor: number,
  smoothKey: string,
  upKey: string,
  downKey: string,
  id?: string,
): any[] => {
  const newDataArray = [];
  dataArray.forEach((priceData, i) => {
    if (i > dataArray.length - 1) return { ...priceData };

    let sum = 0;

    if (priceData['close'] > priceData['open']) {
      sum = sum + priceData[upKey];
    } else {
      sum = sum + priceData[downKey];
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

    const smoothed = smoothFactor > 0 ? sum / (smoothFactor * 2 + 1) : sum;

    newDataArray.push({
      ...priceData,
      [id ? id : 'smoothDirectionExtremes']: smoothed,
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
  id?: string,
): any[] => {
  return dataArray.map((data, i) => {
    if (i < period || !data[key]) return data;

    // const momentum = (data[key] / array[i - factor][key]) * 100;
    const momentum = data[key] - dataArray[i - period][key];

    return { ...data, [id ? id : 'momentum']: momentum };
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
  id?: string,
): any[] => {
  return dataArray.map((priceData, i) => {
    if (i < period || !priceData[key]) return priceData;

    const observableData = dataArray.slice(i - period, i);
    const total = observableData.reduce(
      (total: number, item) => total + item[key],
      0,
    );

    const ma = total / observableData.length;

    return { ...priceData, [id ? id : 'ma']: ma };
  });
};
