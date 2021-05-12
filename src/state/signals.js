import {
  RecoilRoot,
  atom,
  selector,
  selectorFamily,
  useRecoilState,
  useRecoilValue,
} from 'recoil';
import { getSignals } from '../api/db/signals.api';
import ftxapi from '../api/ftx/api';
import { toSeconds } from '../util/time';

export const signalsState = selector({
  key: 'signalsState',
  get: async () => {
    const signals = [];
    const res = await getSignals();
    res.forEach((doc) => {
      signals.push(doc.data());
    });

    return signals;
  },
});

export const marketHistoricalPricesState = atom({
  key: 'marketHistoricalPricesState',
  get: ({ marketId, resolution, startTime }) => async () => {
    console.log(marketId, resolution, startTime);
    try {
      const response = await ftxapi.getHistoricalPrices(
        // marketId,
        // 3600,
        // // toSeconds(1, 'hours'),
        // 'DOGE-PERP',
        marketId,
        resolution,
        startTime,
      );
      console.log(response);
      return response.data.result;
    } catch (error) {
      return [];
    }
  },
});
