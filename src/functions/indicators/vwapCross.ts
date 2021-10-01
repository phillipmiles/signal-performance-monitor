import { calcCross } from "./calcCross";

// Calculates a cross for two different data point.
export const vwapCross = (marketData: any[], vwapId: string): any[] => {
  return marketData.map((current, index) => {
    // Skip first index as we have no other data point yet to look for a crossover.
    if (index === 0) return current;

    const prev = marketData[index - 1];
    console.log("LOOK FOR CROSS", prev[vwapId]);
    // const cross = calcCross(prev, current, shortRSIKey, longRSIKey);
    const cross = calcCross(
      prev[vwapId],
      prev.close,
      current[vwapId],
      current.close
    );

    if (cross) {
      const newData = { ...current };
      if (!newData.indicators) newData.indicators = [];
      const indicator = {
        id: "vwap-cross",
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
