import * as moviesApi from '../../api/db/movies.api';
import { createAsyncSystem } from '../utils';
import { getErrorMessage } from '../../errors/errorCodes';
import { getAuthUser } from '../user/user.selectors';

const getMoviesSystem = createAsyncSystem(
  'GET_MOVIES',
  async (dispatch, getState) => {
    const authUser = getAuthUser(getState());

    if (!authUser) {
      const error = new Error('No auth data found in state.');
      error.code = 'unauthenticated';
      throw error;
    }
    const response = await moviesApi.getMovies(authUser.uid);
    let payload = [];
    response.forEach((doc) => {
      payload.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return payload;
  },
  {
    error: getErrorMessage,
  },
);

// Get movies exports
export const GET_MOVIES_REQUEST = getMoviesSystem.types.request;
export const GET_MOVIES_SUCCESS = getMoviesSystem.types.success;
export const GET_MOVIES_ERROR = getMoviesSystem.types.error;
export const getMovies = getMoviesSystem.actions.main;
export const getMoviesRequest = getMoviesSystem.actions.request;
export const getMoviesSuccess = getMoviesSystem.actions.success;
export const getMoviesError = getMoviesSystem.actions.error;
export const getMoviesLoadingReducer = getMoviesSystem.reducers.loading;
export const getMoviesErrorReducer = getMoviesSystem.reducers.error;
