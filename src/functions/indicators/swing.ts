export const swingHigh = (marketData: any[], range = 4): any[] => {
  return marketData.map((current, index) => {
    if (index < range || index >= marketData.length - range) {
      return current;
    }

    let isHighestHigh = true;
    let rangeIndex = index - range;

    while (rangeIndex < index + range) {
      if (marketData[rangeIndex].high > current.high) {
        isHighestHigh = false;
        break;
      }
      rangeIndex = rangeIndex + 1;
    }

    if (isHighestHigh) {
      const newData = { ...current };
      if (!newData.indicators) newData.indicators = [];

      const indicator = {
        id: "swingHigh",
      };

      newData.indicators.push(indicator);
      return newData;
    }

    return current;
  });
};

export const swingLow = (marketData: any[], range = 4): any[] => {
  return marketData.map((current, index) => {
    if (index < range || index >= marketData.length - range) {
      return current;
    }

    let isLowestLow = true;
    let rangeIndex = index - range;

    while (rangeIndex < index + range) {
      if (marketData[rangeIndex].low < current.low) {
        isLowestLow = false;
        break;
      }
      rangeIndex = rangeIndex + 1;
    }

    if (isLowestLow) {
      const newData = { ...current };
      if (!newData.indicators) newData.indicators = [];

      const indicator = {
        id: "swingLow",
      };

      newData.indicators.push(indicator);
      return newData;
    }

    return current;
  });
};
