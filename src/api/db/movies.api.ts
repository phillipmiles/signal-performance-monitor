import { db } from './db';

class Movie {
  constructor(title: string, director: string, releaseDate) {
    this.title = title;
    this.director = director;
    this.releaseDate = releaseDate;
  }
}

const movieConverter = {
  toFirestore: (movie: Movie) => {
    return {
      name: movie.title,
      director: movie.director,
      releaseDate: movie.releaseDate,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new Movie(data.title, data.director, data.releaseDate);
  },
};

export const getMovies = (userId: string) =>
  db
    .collection('movies')
    .where('uid', '==', userId)
    .withConverter(movieConverter)
    .get();
