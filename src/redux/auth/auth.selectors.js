export const getAuthData = (state) => state.auth;

export const getHasAttemptedAuth = (state) =>
  getAuthData(state).hasAttemptedAuth;
