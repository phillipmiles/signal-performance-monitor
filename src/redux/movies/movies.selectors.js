import { createSelector } from '@reduxjs/toolkit';

export const getMoviesData = (state) => state.movies;

export const getMoviesAllIds = (state) => getMoviesData(state).allIds;
export const getMoviesById = (state) => getMoviesData(state).byId;

// Creates a memoised selector to prevent returning a new reference made by map
// causing unecessary rerenders.
export const getAllMovies = createSelector(
  [getMoviesAllIds, getMoviesById],
  (allIds, byId) => allIds.map((id) => byId[id]),
);

export const getGetMoviesLoading = (state) =>
  getMoviesData(state).getMoviesLoading;
export const getGetMoviesError = (state) => getMoviesData(state).getMoviesError;
