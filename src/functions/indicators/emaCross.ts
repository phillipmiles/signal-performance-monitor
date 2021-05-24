interface EmaCross {
  id: string;
  data: {
    emaLongId: string;
    emaShortId: string;
    type: 'bullish' | 'bearish';
  };
}

export const emaCross = (
  marketData: any[],
  shortEmaKey: string,
  longEmaKey: string,
): any[] => {
  return marketData.map((current, index) => {
    if (index === 0) return current;
    const prev = marketData[index - 1];

    if (prev[longEmaKey] === undefined || prev[shortEmaKey] === undefined)
      return current;

    if (
      Math.sign(prev[longEmaKey] - prev[shortEmaKey]) !==
      Math.sign(current[longEmaKey] - current[shortEmaKey])
    ) {
      const newData = { ...current };
      let type;
      if (Math.sign(current[longEmaKey] - current[shortEmaKey]) === 1) {
        type = 'bearish';
      } else {
        type = 'bullish';
      }
      const indicator: EmaCross = {
        id: 'ema-cross',
        data: {
          emaLongId: '',
          emaShortId: '',
          type: type,
        },
      };
      if (!newData.indicators) newData.indicators = [];

      newData.indicators.push(indicator);

      return newData;
    }
    return current;
  });
};
