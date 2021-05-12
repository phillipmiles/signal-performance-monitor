import * as booksApi from '../../api/db/books.api';
import { createAsyncSystem } from '../utils';
import { getErrorMessage } from '../../errors/errorCodes';

const getBooksSystem = createAsyncSystem(
  'GET_BOOKS',
  async () => {
    const response = await booksApi.getBooks();
    let payload = [];
    response.forEach((doc) => {
      payload.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return payload;
  },
  {
    error: getErrorMessage,
  },
);

// Get books exports
export const GET_BOOKS_REQUEST = getBooksSystem.types.request;
export const GET_BOOKS_SUCCESS = getBooksSystem.types.success;
export const GET_BOOKS_ERROR = getBooksSystem.types.error;
export const getBooks = getBooksSystem.actions.main;
export const getBooksRequest = getBooksSystem.actions.request;
export const getBooksSuccess = getBooksSystem.actions.success;
export const getBooksError = getBooksSystem.actions.error;
export const getBooksLoadingReducer = getBooksSystem.reducers.loading;
export const getBooksErrorReducer = getBooksSystem.reducers.error;
