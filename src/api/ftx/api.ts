import axios, { AxiosResponse, AxiosError } from 'axios';
import { Market } from '../../types/types';
import env from '../../../env';
import { toSeconds } from '../../util/time';
// XXX Caution. There are issues with extending Error.
// https://stackoverflow.com/questions/41102060/typescript-extending-error-class
class ApiError extends Error {
  code: number | undefined;
  codeText: string | undefined;
  request: unknown;
  response: unknown;

  constructor(message?: string) {
    // 'Error' breaks prototype chain here
    super(message);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// XXXX TODO!!!!!
// I should probably convert what's returned from FTX api calls into
// typed interfaces in each api function below. This way I can ensure that if FTX
// changes/depreciates properties from what's returned it won't fill my app with
// dirt data.
// XXXX TODO!!!!!

const createAxiosError = (axiosError: AxiosError) => {
  const error = new ApiError();

  if (!axiosError.response) {
    return error;
  }

  error.code = axiosError.response.status;
  error.codeText = axiosError.response.statusText;
  error.request = axiosError.response.config;
  error.response = axiosError.response.data;
  error.message = axiosError.response.data.error;

  return error;
};

const callApi = async (apiCall: () => Promise<AxiosResponse>): Promise<any> => {
  let response;
  try {
    console.log('call it');
    response = await apiCall();
  } catch (error) {
    // / XXXX If error code is whatever unauthorised is then
    // reattempt call a few times before throwing error.
    throw createAxiosError(error);
  }
  console.log('res?? ', response);
  return response.data.result;
};

// PUBLIC API CALLS

// const getHistoricalPrices = async (marketId: string, timeframe: number) => {
//   const response = await axios.get(
//     `${env.FTX_API_ENDPOINT}/markets/${marketId}/candles`,
//     {
//       params: {
//         resolution: timeframe,
//         limit: 100,
//       },
//     },
//   );
//   console.log('here');
//   console.log(response.data);
//   return response.data.result;
// };
// 1561334400000
// 1620698574201
// 1559881511
const getHistoricalPrices = async (
  marketId: string,
  resolution: number,
  start_time: number,
) => {
  console.log(marketId, resolution, start_time);
  const response = await axios.get(
    `http://localhost:3000/markets/${marketId}/candles`,
    {
      params: {
        start_time: toSeconds(start_time, 'milliseconds'),
        resolution: resolution,
      },
    },
  );
  return response;
};

const getMarkets = async (): Promise<Market[]> =>
  axios.get(`http://localhost:3000/markets`);

const getMarket = async (marketId: string): Promise<Market> => {
  const response = await axios.get(
    `${env.FTX_API_ENDPOINT}/markets/${marketId}`,
  );

  return response.data.result;
};

export default {
  getHistoricalPrices,
  getMarket,
  getMarkets,
};
