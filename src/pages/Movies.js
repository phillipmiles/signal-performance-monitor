/** @jsx jsx */
import { jsx } from 'theme-ui';
import PropTypes from 'prop-types';

const MoviesView = ({ movies, isLoadingMovies, loadingMoviesError }) => {
  return (
    <div>
      <h1>Movies</h1>
      {isLoadingMovies && <p>Loading</p>}
      {loadingMoviesError && <p>{loadingMoviesError} </p>}
      {movies.map((movie) => (
        <p key={movie.id}>{movie.title}</p>
      ))}
    </div>
  );
};

MoviesView.propTypes = {
  movies: PropTypes.array,
  isLoadingMovies: PropTypes.bool,
  loadingMoviesError: PropTypes.string,
};

MoviesView.defaultProps = {
  movies: [],
  isLoadingMovies: false,
  loadingMoviesError: '',
};

export default MoviesView;
