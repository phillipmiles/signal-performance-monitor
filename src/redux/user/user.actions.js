import * as authApi from '../../api/auth/auth.api';
import { createAsyncSystem, makeActionCreator } from '../utils';
import {
  getErrorMessage,
  firebaseErrorCodes,
  customErrorCodes,
} from '../../errors/errorCodes';
import { globalErrorMessage } from '../error/error.actions';
import { setUserId, logLogin, logRegister } from '../../services/analytics';
import { getAuthUser } from './user.selectors';
import { newError } from '../../errors/handleError';

// import { newExceptionError, newValidationError } from '../../errors/errors';

export const SET_USER = 'SET_USER';
export const SHOW_SIGN_IN_METHODS = 'SHOW_SIGN_IN_METHODS';

export const SIGN_IN_REQUEST = 'SIGN_IN_REQUEST';
export const SIGN_IN_SUCCESS = 'SIGN_IN_SUCCESS';
export const SIGN_IN_ERROR = 'SIGN_IN_ERROR';
export const SIGN_IN_CANCEL = 'SIGN_IN_CANCEL';

export const signInRequest = makeActionCreator(SIGN_IN_REQUEST);
export const signInCancel = makeActionCreator(SIGN_IN_CANCEL);
export const signInError = makeActionCreator(SIGN_IN_ERROR, 'error');
export const signInSuccess = makeActionCreator(SIGN_IN_SUCCESS, 'user');

export const showSignInMethods = makeActionCreator(
  SHOW_SIGN_IN_METHODS,
  'methods',
);

export const signIn = ({ email, password }) => {
  return async (dispatch) => {
    try {
      dispatch(signInRequest());
      // const signInMethods = await serverApi.fetchSignInMethodsForEmail(email);
      // if (signInMethods.indexOf('password') >= 0) {
      const response = await authApi.signInWithEmailAndPassword(
        email,
        password,
      );

      // Log sign to analytics.
      logLogin('password');
      return dispatch(signInSuccess(response));
      // } else {
      //   console.log('signInMethods', signInMethods);
      //   if (signInMethods.length > 0) {
      //     // dispatch(showSignInMethods(signInMethods));
      //     // return dispatch(signInCancel());
      //   } else {
      //     const error = new Error(
      //       'The account associated with this email address has no sign in method.',
      //     );
      //     error.code = 'auth/user-not-found';
      //     throw error;
      //   }
      // }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch(signInError(errorMessage));
      throw error;
    }
  };
};

const signOutSystem = createAsyncSystem(
  'SIGN_OUT',
  async () => {
    return await authApi.signOut();
  },
  {
    error: (err, dispatch) => {
      const errorMessage = getErrorMessage(err);
      dispatch(globalErrorMessage(errorMessage));
      return errorMessage;
    },
  },
);

// Sign out exports
export const SIGN_OUT_REQUEST = signOutSystem.types.request;
export const SIGN_OUT_SUCCESS = signOutSystem.types.success;
export const SIGN_OUT_ERROR = signOutSystem.types.error;
export const signOut = signOutSystem.actions.main;
export const signOutRequest = signOutSystem.actions.request;
export const signOutSuccess = signOutSystem.actions.success;
export const signOutError = signOutSystem.actions.error;
export const signOutLoadingReducer = signOutSystem.reducers.loading;
export const signOutErrorReducer = signOutSystem.reducers.error;

export const REGISTER_USER_REQUEST = 'REGISTER_USER_REQUEST';
export const REGISTER_USER_SUCCESS = 'REGISTER_USER_SUCCESS';
export const REGISTER_USER_ERROR = 'REGISTER_USER_ERROR';

export const registerUser = (email, password) => {
  return {
    types: [REGISTER_USER_REQUEST, REGISTER_USER_SUCCESS, REGISTER_USER_ERROR],
    callAPI: async () => {
      const response = await authApi.createUserWithEmailAndPassword(
        email,
        password,
      );

      await authApi.sendVerificationEmail();

      // Log sign to analytics.
      logRegister('password');

      return response;
    },
    payload: { email },
  };
};

const sendEmailVerificationSystem = createAsyncSystem(
  'SEND_EMAIL_VERIFICATION',
  async () => await authApi.sendVerificationEmail(),
  {
    error: getErrorMessage,
  },
);

const verifyEmailSystem = createAsyncSystem(
  'VERIFY_EMAIL',
  async (dispatch, getState, extra, actionCode) => {
    await authApi.applyActionCode(actionCode);

    const currentUser = await authApi.currentUser();

    if (currentUser) {
      // For some reason need reload AND getIdToken with force refresh boolean.
      await currentUser.reload();
      await currentUser.getIdToken(true);
    }
    return;
  },
  {
    error: getErrorMessage,
  },
);

export const CHECK_AUTH_ACTION_CODE_REQUEST = 'CHECK_AUTH_ACTION_CODE_REQUEST';
export const CHECK_AUTH_ACTION_CODE_SUCCESS = 'CHECK_AUTH_ACTION_CODE_SUCCESS';
export const CHECK_AUTH_ACTION_CODE_ERROR = 'CHECK_AUTH_ACTION_CODE_ERROR';

export const checkAuthActionCode = (actionCode) => {
  return {
    types: [
      CHECK_AUTH_ACTION_CODE_REQUEST,
      CHECK_AUTH_ACTION_CODE_SUCCESS,
      CHECK_AUTH_ACTION_CODE_ERROR,
    ],
    callAPI: async () => {
      const response = await authApi.checkActionCode(actionCode);
      if (!response.operation || !authApi.Operations[response.operation]) {
        const error = new Error('Action code response operation is invalid.');
        error.code = 'auth/missing-action-operation';
        throw error;
      }
      return response;
    },
    payload: { actionCode },
  };
};

export const RESET_PASSWORD_REQUEST = 'RESET_PASSWORD_REQUEST';
export const RESET_PASSWORD_SUCCESS = 'RESET_PASSWORD_SUCCESS';
export const RESET_PASSWORD_ERROR = 'RESET_PASSWORD_ERROR';

export const resetPassword = (actionCode, newPassword) => {
  return {
    types: [
      RESET_PASSWORD_REQUEST,
      RESET_PASSWORD_SUCCESS,
      RESET_PASSWORD_ERROR,
    ],
    callAPI: async () => {
      const response = await authApi.confirmPasswordReset(
        actionCode,
        newPassword,
      );

      return response;
    },
  };
};

export const SEND_RESET_PASSWORD_EMAIL_REQUEST =
  'SEND_RESET_PASSWORD_EMAIL_REQUEST';
export const SEND_RESET_PASSWORD_EMAIL_SUCCESS =
  'SEND_RESET_PASSWORD_EMAIL_SUCCESS';
export const SEND_RESET_PASSWORD_EMAIL_ERROR =
  'SEND_RESET_PASSWORD_EMAIL_ERROR';

export const sendResetPasswordEmail = (email) => {
  return {
    types: [
      SEND_RESET_PASSWORD_EMAIL_REQUEST,
      SEND_RESET_PASSWORD_EMAIL_SUCCESS,
      SEND_RESET_PASSWORD_EMAIL_ERROR,
    ],
    callAPI: async () => await authApi.sendPasswordResetEmail(email),
    payload: { email },
  };
};

export const SEND_CHANGE_EMAIL_EMAIL_REQUEST =
  'SEND_CHANGE_EMAIL_EMAIL_REQUEST';
export const SEND_CHANGE_EMAIL_EMAIL_SUCCESS =
  'SEND_CHANGE_EMAIL_EMAIL_SUCCESS';
export const SEND_CHANGE_EMAIL_EMAIL_ERROR = 'SEND_CHANGE_EMAIL_EMAIL_ERROR';

export const sendChangeEmailEmail = (newEmail) => {
  return {
    types: [
      SEND_CHANGE_EMAIL_EMAIL_REQUEST,
      SEND_CHANGE_EMAIL_EMAIL_SUCCESS,
      SEND_CHANGE_EMAIL_EMAIL_ERROR,
    ],
    callAPI: async (dispatch, getState) => {
      if (getAuthUser(getState()).email === newEmail) {
        throw newError({
          message: "Account's email address is already set to this address.",
          code: customErrorCodes.AUTH__NEW_EMAIL_MATCHES_OLD,
        });
      }
      await authApi.sendChangeEmailEmail(newEmail);
    },
    payload: { newEmail },
  };
};

// Verify email exports
export const VERIFY_EMAIL_REQUEST = verifyEmailSystem.types.request;
export const VERIFY_EMAIL_SUCCESS = verifyEmailSystem.types.success;
export const VERIFY_EMAIL_ERROR = verifyEmailSystem.types.error;
export const verifyEmail = verifyEmailSystem.actions.main;
export const verifyEmailRequest = verifyEmailSystem.actions.request;
export const verifyEmailSuccess = verifyEmailSystem.actions.success;
export const verifyEmailError = verifyEmailSystem.actions.error;
export const verifyEmailLoadingReducer = verifyEmailSystem.reducers.loading;
export const verifyEmailErrorReducer = verifyEmailSystem.reducers.error;

// Sign out exports
export const SEND_EMAIL_VERIFICATION_REQUEST =
  sendEmailVerificationSystem.types.request;
export const SEND_EMAIL_VERIFICATION_SUCCESS =
  sendEmailVerificationSystem.types.success;
export const SEND_EMAIL_VERIFICATION_ERROR =
  sendEmailVerificationSystem.types.error;
export const sendEmailVerification = sendEmailVerificationSystem.actions.main;
export const sendEmailVerificationRequest =
  sendEmailVerificationSystem.actions.request;
export const sendEmailVerificationSuccess =
  sendEmailVerificationSystem.actions.success;
export const sendEmailVerificationError =
  sendEmailVerificationSystem.actions.error;
export const sendEmailVerificationLoadingReducer =
  sendEmailVerificationSystem.reducers.loading;
export const sendEmailVerificationErrorReducer =
  sendEmailVerificationSystem.reducers.error;

export const setAuthUser = (user) => {
  // Set user id for analytics
  if (user && user.uid) {
    setUserId(user.uid);
  }

  return {
    type: SET_USER,
    user: user && {
      displayName: user.displayName,
      email: user.email,
      emailVerified: user.emailVerified,
      isAnonymous: user.isAnonymous,
      metadata: user.metadata,
      phoneNumber: user.phoneNumber,
      photoURL: user.photoURL,
      providerData: user.providerData,
      providerId: user.providerId,
      uid: user.uid,
    },
  };
};
