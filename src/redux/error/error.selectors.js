export const getErrorData = (state) => state.error;

export const getGlobalErrorMessage = (state) =>
  getErrorData(state).globalErrorMessage;
