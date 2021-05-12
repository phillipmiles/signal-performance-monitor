import { combineReducers } from 'redux';
import {
  SET_USER,
  SIGN_IN_REQUEST,
  // SIGN_IN_CANCEL,
  SIGN_IN_ERROR,
  SIGN_IN_SUCCESS,
  REGISTER_USER_REQUEST,
  REGISTER_USER_SUCCESS,
  REGISTER_USER_ERROR,
  CHECK_AUTH_ACTION_CODE_REQUEST,
  CHECK_AUTH_ACTION_CODE_SUCCESS,
  CHECK_AUTH_ACTION_CODE_ERROR,
  SEND_RESET_PASSWORD_EMAIL_REQUEST,
  SEND_RESET_PASSWORD_EMAIL_SUCCESS,
  SEND_RESET_PASSWORD_EMAIL_ERROR,
  signOutLoadingReducer,
  signOutErrorReducer,
  verifyEmailErrorReducer,
  verifyEmailLoadingReducer,
  sendEmailVerificationErrorReducer,
  sendEmailVerificationLoadingReducer,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_ERROR,
  RESET_PASSWORD_SUCCESS,
} from './user.actions.js';
import { createAsyncReducers } from '../utils';

const authUser = (state = null, action) => {
  switch (action.type) {
    case SET_USER:
      // Returns null if no user object is passed.
      console.log(action.user);
      return action.user
        ? {
            displayName: action.user && action.user.displayName,
            email: action.user && action.user.email,
            emailVerified: action.user && action.user.emailVerified,
            isAnonymous: action.user && action.user.isAnonymous,
            metadata: action.user && action.user.metadata,
            phoneNumber: action.user && action.user.phoneNumber,
            photoURL: action.user && action.user.photoURL,
            providerData: action.user && action.user.providerData,
            providerId: action.user && action.user.providerId,
            uid: action.user && action.user.uid,
          }
        : null;
    default:
      return state;
  }
};

const signInReducers = createAsyncReducers(
  SIGN_IN_REQUEST,
  SIGN_IN_SUCCESS,
  SIGN_IN_ERROR,
);

const registerUser = createAsyncReducers(
  REGISTER_USER_REQUEST,
  REGISTER_USER_SUCCESS,
  REGISTER_USER_ERROR,
);

const checkAuthActionCode = createAsyncReducers(
  CHECK_AUTH_ACTION_CODE_REQUEST,
  CHECK_AUTH_ACTION_CODE_SUCCESS,
  CHECK_AUTH_ACTION_CODE_ERROR,
);

const resetPassword = createAsyncReducers(
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_ERROR,
);

const sendResetPasswordEmail = createAsyncReducers(
  SEND_RESET_PASSWORD_EMAIL_REQUEST,
  SEND_RESET_PASSWORD_EMAIL_SUCCESS,
  SEND_RESET_PASSWORD_EMAIL_ERROR,
);

export default combineReducers({
  authUser,
  signInError: signInReducers.error,
  signInLoading: signInReducers.loading,
  signOutError: signOutErrorReducer,
  signOutLoading: signOutLoadingReducer,
  registerUserError: registerUser.error,
  registerUserLoading: registerUser.loading,
  verifyEmailError: verifyEmailErrorReducer,
  verifyEmailLoading: verifyEmailLoadingReducer,
  sendEmailVerificationError: sendEmailVerificationErrorReducer,
  sendEmailVerificationLoading: sendEmailVerificationLoadingReducer,
  sendResetPasswordEmailError: sendResetPasswordEmail.error,
  sendResetPasswordEmailLoading: sendResetPasswordEmail.loading,
  checkAuthActionCodeLoading: checkAuthActionCode.loading,
  checkAuthActionCodeError: checkAuthActionCode.error,
  resetPasswordLoading: resetPassword.loading,
  resetPasswordError: resetPassword.error,
});
