export const getUserData = (state) => state.user;

// Returns the user object for the currently authenticated user.
export const getAuthUser = (state) => getUserData(state).authUser;

export const getSignInLoading = (state) => getUserData(state).signInLoading;
export const getSignInError = (state) => getUserData(state).signInError;

export const getSignOutLoading = (state) => getUserData(state).signOutLoading;
export const getSignOutError = (state) => getUserData(state).signOutError;

export const getRegisterUserLoading = (state) =>
  getUserData(state).registerUserLoading;
export const getRegisterUserError = (state) =>
  getUserData(state).registerUserError;

export const getVerifyEmailLoading = (state) =>
  getUserData(state).verifyEmailLoading;
export const getVerifyEmailError = (state) =>
  getUserData(state).verifyEmailError;

export const getSendEmailVerificationLoading = (state) =>
  getUserData(state).sendEmailVerificationLoading;
export const getSendEmailVerificationError = (state) =>
  getUserData(state).sendEmailVerificationError;

export const getSendResetPasswordEmailLoading = (state) =>
  getUserData(state).sendResetPasswordEmailLoading;
export const getSendResetPasswordEmailError = (state) =>
  getUserData(state).sendResetPasswordEmailError;

export const getResetPasswordLoading = (state) =>
  getUserData(state).resetPasswordLoading;
export const getResetPasswordError = (state) =>
  getUserData(state).resetPasswordError;

export const getCheckAuthActionCodeLoading = (state) =>
  getUserData(state).checkAuthActionCodeLoading;
export const getCheckAuthActionCodeError = (state) =>
  getUserData(state).checkAuthActionCodeError;
