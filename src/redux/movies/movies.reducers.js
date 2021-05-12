import {
  GET_MOVIES_SUCCESS,
  getMoviesLoadingReducer,
  getMoviesErrorReducer,
} from './movies.actions';
import { combineReducers } from 'redux';

const byId = (state = {}, action) => {
  switch (action.type) {
    case GET_MOVIES_SUCCESS:
      const newState = {};
      action.data.forEach((movie) => (newState[movie.id] = movie));
      return newState;
    default:
      return state;
  }
};

const allIds = (state = [], action) => {
  switch (action.type) {
    case GET_MOVIES_SUCCESS:
      return action.data.map((movies) => movies.id);

    default:
      return state;
  }
};

export default combineReducers({
  byId,
  allIds,
  getMoviesLoading: getMoviesLoadingReducer,
  getMoviesError: getMoviesErrorReducer,
});
