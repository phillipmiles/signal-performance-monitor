import { calcCross } from "./calcCross";

// Calculates a cross for two different data point.
export const stochasticCross = (
  marketData: any[],
  shortRSIKey: string,
  longRSIKey: string
): any[] => {
  return marketData.map((current, index) => {
    // Skip first index as we have no other data point yet to look for a crossover.
    if (index === 0) return current;

    const prev = marketData[index - 1];

    // const cross = calcCross(prev, current, shortRSIKey, longRSIKey);
    const cross = calcCross(
      prev.fullSTO.K,
      prev.fullSTO.D,
      current.fullSTO.K,
      current.fullSTO.D
    );

    if (cross) {
      const newData = { ...current };
      if (!newData.indicators) newData.indicators = [];
      const indicator = {
        id: "stochastic-cross",
        data: {
          type: "",
        },
      };
      if (cross === "positive") {
        indicator.data.type = "bullish";
      } else if (cross === "negative") {
        indicator.data.type = "bearish";
      }
      newData.indicators.push(indicator);
      return newData;
    } else {
      return current;
    }
  });
};
