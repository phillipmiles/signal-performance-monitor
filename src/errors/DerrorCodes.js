// import * as errorMessages from './messages';

// // Firebase Auth error codes - https://firebase.google.com/docs/reference/js/firebase.auth.Auth#error-codes_3
// const errorMessageByErrorCode = {
//   'permission-denied': errorMessages.permissionDeniedErrorMessage,
//   unauthenticated: errorMessages.userUnauthenticated,
//   'auth/invalid-email': errorMessages.invalidEmailErrorMessage,
//   'auth/too-many-requests': errorMessages.tooManyAttemptsErrorMessage,
//   'auth/user-disabled': errorMessages.signInUserDisabledErrorMessage,
//   'auth/user-not-found': errorMessages.signInEmailNotFoundErrorMessage,
//   'auth/wrong-password': errorMessages.signInWrongPasswordErrorMessage,
//   'auth/email-already-in-use': errorMessages.registerUserEmailInUseErrorMessage,
//   'auth/operation-not-allowed':
//     errorMessages.registerUserNotAllowedErrorMessage,
//   'auth/weak-password': errorMessages.registerUserWeakPasswordErrorMessage,
//   // Occurs when the send verification email function is configured with a domain that is unauthorized.
//   // Authorize a domain from Firebase Console > Authentication > Sign-in Methods
//   'auth/unauthorized-domain': errorMessages.fallbackErrorMessage,
//   // Occurs when an action code like the ones used for email verification is invalid or has already been used.
//   'auth/invalid-action-code': errorMessages.invalidLinkErrorMessage,
//   // Occurs when an action code has expired.
//   'auth/expired-action-code': errorMessages.invalidLinkErrorMessage,
//   // When an auth email action is attempted to be sent without a continue URI set.
//   'auth/missing-continue-uri': errorMessages.malformedRequest,
//   // When an auth email action is attempted to be sent with and invalid continue URI set.
//   'auth/invalid-continue-uri': errorMessages.malformedRequest,
//   // When an auth email action is attempted to be sent with a continue URI the domain of which has not been
//   // whitelisted in Firebase console.
//   'auth/unauthorized-continue-uri': errorMessages.malformedRequest,
//   'auth/missing-action-operation': errorMessages.fallbackErrorMessage,
// };

// export const getErrorMessage = (error) =>
//   error && errorMessageByErrorCode[error.code]
//     ? errorMessageByErrorCode[error.code]
//     : errorMessages.fallbackErrorMessage;

// export const getErrorMessageByCode = (errorCode) =>
//   errorMessageByErrorCode[errorCode]
//     ? errorMessageByErrorCode[errorCode]
//     : errorMessages.fallbackErrorMessage;
