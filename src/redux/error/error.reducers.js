import { combineReducers } from 'redux';
import { GLOBAL_ERROR_MESSAGE } from './error.actions.js';

const globalErrorMessage = (state = '', action) => {
  switch (action.type) {
    case GLOBAL_ERROR_MESSAGE:
      return action.error;
    default:
      return state;
  }
};

export default combineReducers({
  globalErrorMessage,
});
