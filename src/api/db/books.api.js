import { db } from './db';

class Book {
  constructor(title, author, datePublished) {
    this.title = title;
    this.author = author;
    this.datePublished = datePublished;
  }
}

const bookConverter = {
  toFirestore: (book) => {
    return {
      name: book.title,
      author: book.author,
      datePublished: book.datePublished,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new Book(data.title, data.author, data.datePublished);
  },
};

export const getBooks = () =>
  db.collection('books').withConverter(bookConverter).get();
