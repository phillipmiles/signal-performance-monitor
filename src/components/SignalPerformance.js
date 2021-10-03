/** @jsx jsx */
import { jsx, Flex } from "theme-ui";
import { useRecoilValue } from "recoil";
import { signalsState, marketHistoricalPricesState } from "../state/signals";
import ActivityIndicator from "../components/ActivityIndicator";
import Paragraph from "./generic/Paragraph";
import Text from "./generic/Text";
import Heading from "./generic/Heading";
import { useEffect, useState, useCallback, Fragment, useMemo } from "react";
import ftxapi from "../api/ftx/api";
import { toMilliseconds, toSeconds } from "../util/time";

const calcROI = (initialVal, finalVal, cost) =>
  ((finalVal - initialVal) / cost) * 100;

const SignalPerformance = ({
  id,
  startTime,
  targetEntryPrice,
  stopLossPrice,
  side,
  targets,
}) => {
  // const prices = useRecoilValue(
  //   marketHistoricalPricesState({
  //     marketId: id,
  //     resolution: 60,
  //     startTime: startTime,
  //   }),
  // );
  const [error, setError] = useState("");
  const [prices, setPrice] = useState([]);
  const [currentStopLossPrice, setCurrentStopLossPrice] = useState(
    stopLossPrice
  );
  const [targetHitIndices, setTargetHitIndices] = useState([]);
  const [stopLossHitIndex, setStopLossHitIndex] = useState();
  // ROI percentage if stoploss is hit, includes any profit taken.
  const [minimumROI, setMinimumROI] = useState(
    calcROI(targetEntryPrice, stopLossPrice, targetEntryPrice)
  );
  const [enterIndex, setEnterIndex] = useState();
  const [entryPrice, setEntryPrice] = useState();
  // const [isLoading, setIsLoading] = useState(false);

  const getHistoricalPrices = useCallback(
    async (marketId, resolution, startTime) => {
      const fetchData = async (marketId, resolution, startTime) => {
        const response = await ftxapi.getHistoricalPrices(
          marketId,
          resolution,
          startTime
        );
        const data = response.data.result;

        // XXX This still needs testing!!!! Make sure we aren't re-adding the last
        // item.
        if (
          data[data.length - 1].time <
          new Date().getTime() - toMilliseconds(1, "hours")
        ) {
          console.log("do a thing");
          data.push(
            await fetchData(marketId, resolution, data[data.length - 1].time)
          );
        }

        return data;
      };
      console.log("start time", startTime);
      try {
        const prices = await fetchData(
          marketId,
          resolution,
          // Need to take an hour off start time so we get the candle that
          // the startTime value is a part of.
          startTime - toMilliseconds(1, "hours")
        );
        setPrice(prices);
        console.log(prices);
      } catch (error) {
        setError("There was an error");
      }
    },
    []
  );

  useEffect(() => {
    // Initial amount of investment left. 1 = 100%.
    let investmentQuantity = 1;
    let enterIndex;
    let stopLossIndex;
    let targetIndices = [];
    let currentStopLossPrice = stopLossPrice;
    let stopLossHitROI;
    // let percentageInvested = 1;
    let entryPrice;
    // let priceChange =

    console.log("ROI", stopLossHitROI);
    prices.forEach((price, index) => {
      // Check for entry
      // This is a little inprecise. Takes opening price for the hour.
      if (enterIndex === undefined) {
        if (side === "buy" && price.low < targetEntryPrice) {
          entryPrice = price.open < targetEntryPrice ? price.open : price.low;
          enterIndex = index;
          stopLossHitROI = calcROI(entryPrice, stopLossPrice, entryPrice);
        } else if (side === "sell" && price.high > targetEntryPrice) {
          entryPrice = price.open < targetEntryPrice ? price.open : price.low;
          enterIndex = index;
          stopLossHitROI = calcROI(entryPrice, stopLossPrice, entryPrice);
        }
      }

      // Check for stoploss hit
      if (enterIndex !== undefined && !stopLossIndex) {
        if (side === "buy" && price.low < currentStopLossPrice) {
          stopLossIndex = index;
        } else if (side === "sell" && price.high > currentStopLossPrice) {
          stopLossIndex = index;
        }
      }

      // 100
      // 12

      // Check for target hits
      if (targetIndices.length < targets.length) {
        // XXXXX This doesn't work if multiple targets are hit in the same candle.
        if (side === "buy" && price.high > targets[targetIndices.length]) {
          // percentageInvested;
          // const profit = targets[targetIndices.length] - targetEntryPrice;
          targetIndices.push(index);
          if (targetIndices.length === 1) {
            currentStopLossPrice = targetEntryPrice;
          } else {
            currentStopLossPrice = targets[targetIndices.length - 2];
          }
          // Take 20% off investment quantity
          console.log("HEEEEEERERERE!!!");
          // investmentQuantity = investmentQuantity - investmentQuantity * 0.2;
          let quantity = 1;
          let securedProfit = 0;

          targetIndices.forEach((targetIndices, index) => {
            securedProfit = securedProfit + quantity * targets[index] * 0.2;
            console.log(quantity * targets[index] * 0.2);
            quantity = quantity - quantity * 0.2;
          });
          console.log(
            securedProfit,
            quantity,
            currentStopLossPrice,
            quantity * currentStopLossPrice
          );
          stopLossHitROI = calcROI(
            entryPrice,
            quantity * currentStopLossPrice + securedProfit,
            entryPrice
          );
        } else if (
          side === "sell" &&
          price.low < targets[targetIndices.length]
        ) {
          targetIndices.push(index);
          if (targetIndices.length === 1) {
            currentStopLossPrice = targetEntryPrice;
          } else {
            currentStopLossPrice = targets[targetIndices.length - 1];
          }
          stopLossHitROI = calcROI(
            entryPrice,
            currentStopLossPrice,
            entryPrice
          );
        }
      }
    });

    setStopLossHitIndex(stopLossIndex);
    setEnterIndex(enterIndex);
    setEnterIndex(enterIndex);
    setTargetHitIndices(targetIndices);
    setCurrentStopLossPrice(currentStopLossPrice);
    setEntryPrice(entryPrice);
    setMinimumROI(stopLossHitROI);

    return enterIndex;
  }, [targetEntryPrice, prices, side, entryPrice, stopLossPrice, targets]);

  /*

sl $80
init $100 1
t1 $120   0.8 0.2 (20%) (120-100)/100 = 0.2 (20% increase) | take 20% profit   120 * 0.2 = $24  investment remaining = $96
t2 $140   0.64 0.16 (20%)  20% profit   140 * 0.2 = $24


*/
  useEffect(() => {
    getHistoricalPrices(id, toSeconds(1, "hours"), startTime);
  }, [id, getHistoricalPrices, startTime]);

  console.log(prices);

  const status = useMemo(() => {
    if (enterIndex === undefined) {
      return "Waiting for entry";
    }
    if (enterIndex >= 0 && stopLossHitIndex === undefined) {
      return "Entered";
    }
    if (stopLossHitIndex >= 0) {
      return "Stoploss hit";
    }
  }, [enterIndex, stopLossHitIndex]);

  return (
    <div>
      <Heading as="h6">Performance</Heading>
      {error && <Paragraph>{error}</Paragraph>}
      {prices.length > 0 && (
        <Fragment>
          <Paragraph>Status: {status}</Paragraph>
          {enterIndex >= 0 && (
            <Fragment>
              {enterIndex !== undefined && (
                <Paragraph>
                  Enter at ${entryPrice} at{" "}
                  {new Date(prices[enterIndex].time).toLocaleString()}
                </Paragraph>
              )}
              {stopLossHitIndex !== undefined && (
                <Paragraph>
                  Stop loss hit{" "}
                  {new Date(
                    prices[stopLossHitIndex].startTime
                  ).toLocaleString()}
                </Paragraph>
              )}
              {targetHitIndices.length > 0 && (
                <Paragraph>
                  Reached target.. {targetHitIndices.length} at{" "}
                  {new Date(
                    prices[
                      targetHitIndices[targetHitIndices.length - 1]
                    ].startTime
                  ).toLocaleString()}
                </Paragraph>
              )}
              <Paragraph>
                Stop Loss currently at.. ${currentStopLossPrice}.
              </Paragraph>
              {/* Percentage rise in price???? */}
              <Paragraph>
                Overal price movement...
                {stopLossHitIndex
                  ? calcROI(entryPrice, currentStopLossPrice, entryPrice)
                  : calcROI(
                      entryPrice,
                      prices[prices.length - 1].close,
                      entryPrice
                    )}
                %
              </Paragraph>
              {/* Current ROI - current price ontop of profit taken */}
              {/* <Paragraph>Current ROI... {minimumROI}%</Paragraph> */}
              {/* Percentage ROI you'll get if stoploss is hit whereever it is. */}
              {minimumROI && (
                <Paragraph>Minimum ROI... {minimumROI}%</Paragraph>
              )}
            </Fragment>
          )}
        </Fragment>
      )}
    </div>
  );
};

export default SignalPerformance;
