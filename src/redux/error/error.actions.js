import { makeActionCreator } from '../utils';

export const GLOBAL_ERROR_MESSAGE = 'GLOBAL_ERROR_MESSAGE';

export const globalErrorMessage = makeActionCreator(
  GLOBAL_ERROR_MESSAGE,
  'error',
);
