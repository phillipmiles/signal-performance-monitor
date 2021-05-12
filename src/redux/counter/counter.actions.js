import { makeActionCreator } from '../utils';

export const INCREMENT_COUNTER = 'INCREMENT_COUNTER';

export const incrementCounter = makeActionCreator(INCREMENT_COUNTER);
