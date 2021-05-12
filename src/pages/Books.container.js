/** @jsx jsx */
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { jsx } from 'theme-ui';
import Books from './Books';
import { getAllBooks } from '../redux/books/books.selectors';
import { useGetBooksAsyncController } from '../redux/books/books.controllers';

const BooksContainer = () => {
  const books = useSelector(getAllBooks);
  const [
    getBooks,
    isGettingBooks,
    gettingBooksError,
    // clearGetBooksError,
  ] = useGetBooksAsyncController();

  useEffect(() => {
    const asyncGetBooks = async () => {
      try {
        await getBooks();
      } catch (err) {
        // Do nothing
      }
    };

    asyncGetBooks();
  }, [getBooks]);

  return (
    <Books
      books={books}
      isLoadingBooks={isGettingBooks}
      loadingBooksError={gettingBooksError}
    />
  );
};

export default BooksContainer;
