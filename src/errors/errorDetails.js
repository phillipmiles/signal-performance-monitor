import {
  firebaseErrorCodes as FBCodes,
  customErrorCodes as CCODES,
} from './errorCodes';

export const VALIDATION = 'validation';
export const EXCEPTION = 'exception';

export const errorDetails = {
  [FBCodes.AUTH__REQUIRES_RECENT_LOGIN]: {
    type: VALIDATION,
    message: 'This action requires you to log back in as a security measure.',
  },
  [FBCodes.AUTH__EMAIL_IN_USE]: {
    type: VALIDATION,
    message: 'This email address is already in use by another account.',
  },
  [FBCodes.AUTH__OPERATION_NOT_ALLOWED]: {
    type: EXCEPTION,
    message:
      "Whoops, apparently we didn't set this up right. That's our bad. Someone has been notified and will work to fix this as soon as possible.",
  },
  [CCODES.AUTH__NEW_EMAIL_MATCHES_OLD]: {
    type: VALIDATION,
    message:
      "Your account's email address is already set to this email address.",
  },
};

const fallbackMessage = 'Something went wrong.';

const getErrorDetails = (errorCode) => {
  if (errorDetails[errorCode]) {
    return errorDetails[errorCode];
  } else {
    return {
      type: EXCEPTION,
      message: fallbackMessage,
    };
  }
};

export default getErrorDetails;
