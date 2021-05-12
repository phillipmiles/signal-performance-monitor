import { getErrorMessageByCode } from './errorMessages';
import { captureException } from '../services/sentry';

interface ErrorParams {
  code?: string;
  message?: string;
  stack?: string;
}

// XXX Stopped using extended Error class as you can't set custom methods onto it.
// The work around was to change prototype values but that's super hacky and
// apparently breaks other stuff.

// class ExceptionError extends Error {
//   name: string;
//   code: string;
//   debugMessage: string;
//   stack?: string;

//   constructor({ code, message, stack }: Props) {
//     super(getErrorMessageByCode(code));
//     this.name = 'ExceptionError';
//     this.code = code;
//     this.debugMessage = message;
//     this.stack = stack;

//     // Set the prototype explicitly.
//     Object.setPrototypeOf(this, ExceptionError.prototype);
//   }

//   public report(): void {
//     console.warn(this);
//     captureException(this);
//   }
// }

const addGenericErrorData = (errorData) => {
  let error;

  if (errorData instanceof Error) {
    error = errorData;
    error.debug = errorData.message;
    error.message = getErrorMessageByCode(errorData['code']);
  } else if (typeof errorData === 'string') {
    error = new Error();
    error.debug = errorData;
    error.message = getErrorMessageByCode();
  } else {
    const { message, code, stack } = errorData;
    error = new Error();

    error.message = getErrorMessageByCode(code);
    error.debug = message;
    error.code = code;
    error.stack = stack;
  }

  return error;
};

export const newExceptionError = (errorData: ErrorParams): Error => {
  const error = addGenericErrorData(errorData);

  error['report'] = () => {
    console.warn(error);
    captureException(error);
  };

  return error;
};

export const newValidationError = (errorData: ErrorParams): Error => {
  const error = addGenericErrorData(errorData);

  return error;
};
