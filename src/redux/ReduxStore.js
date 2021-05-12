import React from 'react';
import PropTypes from 'prop-types';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import userReducer from './user/user.reducers';
import authReducer from './auth/auth.reducers';
import counterReducer from './counter/counter.reducers';
import booksReducer from './books/books.reducers';
import moviesReducer from './movies/movies.reducers';
import errorReducer from './error/error.reducers';
import { SIGN_OUT_SUCCESS } from './user/user.actions';
import { sentryReduxEnhancer } from '../services/sentry';
import { callAPIMiddleware } from './middleware';
// Passed in reducer resets it's data to the reducer's default
// state after a logged in user signs out.
export const protectedReducer = (reducer) => {
  return (state, action) => {
    if (action.type === SIGN_OUT_SUCCESS) {
      state = undefined;
    }

    return reducer(state, action);
  };
};

const rootReducer = combineReducers({
  // entities: combineReducers({
  //   streams: streamsReducer,
  //   notes: notesReducer,
  // }),
  // ui: uiReducer,
  auth: authReducer,
  counter: counterReducer,
  user: protectedReducer(userReducer),
  books: protectedReducer(booksReducer),
  movies: protectedReducer(moviesReducer),
  error: errorReducer,
});

const middleware = applyMiddleware(callAPIMiddleware, thunk);
const composedEnhancers = compose(middleware, sentryReduxEnhancer);

const store = createStore(rootReducer, undefined, composedEnhancers);

const ReduxStore = ({ children }) => (
  <Provider store={store}>{children}</Provider>
);

ReduxStore.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ReduxStore;
