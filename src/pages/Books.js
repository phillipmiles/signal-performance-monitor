/** @jsx jsx */
import { jsx } from 'theme-ui';
import PropTypes from 'prop-types';

const BooksView = ({ books, isLoadingBooks, loadingBooksError }) => {
  return (
    <div>
      <h1>Books</h1>
      {isLoadingBooks && <p>Loading</p>}
      {loadingBooksError && <p>{loadingBooksError} </p>}
      {books.map((book) => (
        <p key={book.id}>{book.title}</p>
      ))}
    </div>
  );
};

BooksView.propTypes = {
  books: PropTypes.array,
  isLoadingBooks: PropTypes.bool,
  loadingBooksError: PropTypes.string,
};

BooksView.defaultProps = {
  books: [],
  isLoadingBooks: false,
  loadingBooksError: '',
};

export default BooksView;
