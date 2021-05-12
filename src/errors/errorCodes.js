// https://firebase.google.com/docs/reference/js/firebase.auth.Auth#error-codes_3
const AUTH__REQUIRES_RECENT_LOGIN = 'auth/requires-recent-login';
const AUTH__EMAIL_IN_USE = 'auth/email-already-in-use';
const AUTH__OPERATION_NOT_ALLOWED = 'auth/operation-not-allowed';

export const firebaseErrorCodes = {
  AUTH__REQUIRES_RECENT_LOGIN,
  AUTH__EMAIL_IN_USE,
  AUTH__OPERATION_NOT_ALLOWED,
};

const AUTH__NEW_EMAIL_MATCHES_OLD = 'auth/new-email-matches-old';

export const customErrorCodes = {
  AUTH__NEW_EMAIL_MATCHES_OLD,
};
