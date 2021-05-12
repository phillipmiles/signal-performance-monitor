/** @jsx jsx */
import { jsx } from 'theme-ui';
import Movies from './Movies';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { getAllMovies } from '../redux/movies/movies.selectors';
import { useGetMoviesAsyncController } from '../redux/movies/movies.controllers';

const MoviesContainer = () => {
  const movies = useSelector(getAllMovies);
  const [
    getMovies,
    isGettingMovies,
    gettingMoviesError,
    // clearGetMoviesError,
  ] = useGetMoviesAsyncController();

  useEffect(() => {
    const asyncGetMovies = async () => {
      try {
        await getMovies();
      } catch (err) {
        // Do nothing
      }
    };

    asyncGetMovies();
  }, [getMovies]);

  return (
    <Movies
      movies={movies}
      isLoadingMovies={isGettingMovies}
      loadingMoviesError={gettingMoviesError}
    />
  );
};

export default MoviesContainer;
