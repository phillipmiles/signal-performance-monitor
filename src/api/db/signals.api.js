import { db } from './db';

export const getSignals = () =>
  db.collection('signals').orderBy('timestamp', 'desc').get();
