import {
  GET_BOOKS_SUCCESS,
  getBooksLoadingReducer,
  getBooksErrorReducer,
} from './books.actions';
import { combineReducers } from 'redux';

const byId = (state = {}, action) => {
  switch (action.type) {
    case GET_BOOKS_SUCCESS:
      const newState = {};
      action.data.forEach((book) => (newState[book.id] = book));
      return newState;
    default:
      return state;
  }
};

const allIds = (state = [], action) => {
  switch (action.type) {
    case GET_BOOKS_SUCCESS:
      return action.data.map((book) => book.id);

    default:
      return state;
  }
};

export default combineReducers({
  byId,
  allIds,
  getBooksLoading: getBooksLoadingReducer,
  getBooksError: getBooksErrorReducer,
});
