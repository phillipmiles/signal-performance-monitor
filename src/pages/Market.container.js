/** @jsx jsx */
import { useEffect, useCallback, useState } from 'react';
import { useParams } from 'react-router';
import { jsx } from 'theme-ui';
import Market from './Market';
import ftxapi from '../api/ftx/api';
import { toMilliseconds, toSeconds } from '../util/time';

const MarketContainer = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState('');

  let { marketId } = useParams();
  const splitMarketId = marketId.split('_');
  const baseCoin = splitMarketId[0];
  const coinMarket = splitMarketId[1].toLowerCase();
  const marketSymbol = coinMarket === 'perp' ? '-' : '/';
  const apiMarketId = baseCoin + marketSymbol + coinMarket;

  const getHistoricalPrices = useCallback(
    async (marketId, resolution, startTime) => {
      const fetchData = async (marketId, resolution, startTime) => {
        const response = await ftxapi.getHistoricalPrices(
          marketId,
          resolution,
          startTime,
        );
        const data = response.data.result;

        // XXX This still needs testing!!!! Make sure we aren't re-adding the last
        // item.
        if (
          data[data.length - 1].time <
          new Date().getTime() - toMilliseconds(1, 'hours')
        ) {
          console.log('do a thing');
          data.push(
            await fetchData(marketId, resolution, data[data.length - 1].time),
          );
        }

        return data;
      };
      console.log('start time', startTime);
      try {
        const data = await fetchData(
          marketId,
          toSeconds(1, 'hours'),
          // Need to take an hour off start time so we get the candle that
          // the startTime value is a part of.
          startTime - toMilliseconds(1, 'hours'),
        );
        setData(data);
      } catch (error) {
        setError(error.message);
      }
    },
    [],
  );

  useEffect(() => {
    // const asyncGetBooks = async () => {
    //   try {
    //     await getHistoricalPrices();
    //   } catch (err) {
    //     // Do nothing
    //   }
    // };

    // asyncGetBooks();
    getHistoricalPrices(
      apiMarketId,
      60,
      new Date().getTime() - toMilliseconds(7, 'days'),
    );
  }, [getHistoricalPrices, apiMarketId]);

  return (
    <Market
      marketId={apiMarketId}
      marketData={data}
      error={error}
      // books={books}
      // isLoadingBooks={isGettingBooks}
      // loadingBooksError={gettingBooksError}
    />
  );
};

export default MarketContainer;
