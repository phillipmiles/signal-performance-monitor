import { getMovies, getMoviesError } from './movies.actions';
import { getGetMoviesLoading, getGetMoviesError } from './movies.selectors';
import { useAsyncController } from '../utils';

export const useGetMoviesAsyncController = () =>
  useAsyncController(
    getMovies,
    getGetMoviesLoading,
    getGetMoviesError,
    getMoviesError,
  );
