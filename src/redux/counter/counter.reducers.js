import { INCREMENT_COUNTER } from './counter.actions';
import { combineReducers } from 'redux';

const value = (state = 0, action) => {
  switch (action.type) {
    case INCREMENT_COUNTER:
      return state + 1;

    default:
      return state;
  }
};

export default combineReducers({ value: value });
