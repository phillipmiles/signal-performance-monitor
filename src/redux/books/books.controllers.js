import { getBooks, getBooksError } from './books.actions';
import { getGetBooksLoading, getGetBooksError } from './books.selectors';
import { useAsyncController } from '../utils';

export const useGetBooksAsyncController = () =>
  useAsyncController(
    getBooks,
    getGetBooksLoading,
    getGetBooksError,
    getBooksError,
  );
