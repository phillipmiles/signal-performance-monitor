import { createSelector } from '@reduxjs/toolkit';

export const getBooksData = (state) => state.books;

export const getBooksAllIds = (state) => getBooksData(state).allIds;
export const getBooksById = (state) => getBooksData(state).byId;

// Creates a memoised selector to prevent returning a new reference made by map
// causing unecessary rerenders.
export const getAllBooks = createSelector(
  [getBooksAllIds, getBooksById],
  (allIds, byId) => allIds.map((id) => byId[id]),
);

export const getGetBooksLoading = (state) =>
  getBooksData(state).getBooksLoading;
export const getGetBooksError = (state) => getBooksData(state).getBooksError;
