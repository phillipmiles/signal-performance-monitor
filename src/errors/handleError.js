import getErrorDetails, { EXCEPTION } from './errorDetails';
import { captureException } from '../services/sentry';

export const newError = (errorData) => {
  const error = errorData instanceof Error ? errorData : new Error();

  error.code = errorData.code;
  error.debug = errorData.message ? errorData.message : errorData;
  error.type = getErrorDetails(errorData.code).type;
  error.message = getErrorDetails(errorData.code).message;

  return error;
};

export const reportError = (error) => {
  console.warn(error);
  captureException(error);
};

const handleError = (error) => {
  if (!error.type) {
    error = newError(error);
  }

  if (error.type === EXCEPTION) {
    reportError(error);
  }
  console.log(error.type);
  return error;
};

export default handleError;
