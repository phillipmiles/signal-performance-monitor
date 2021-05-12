import { combineReducers } from 'redux';
import { SET_USER } from '../user/user.actions.js';

const hasAttemptedAuth = (state = false, action) => {
  switch (action.type) {
    case SET_USER:
      return true;
    default:
      return state;
  }
};

export default combineReducers({
  hasAttemptedAuth,
});
