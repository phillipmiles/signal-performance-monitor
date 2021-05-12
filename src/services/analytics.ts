import firebase from './firebase';
import { newError } from '../errors/handleError';

export const initAnalytics = (): void => {
  try {
    firebase.analytics();
  } catch (error) {
    throw newError(error);
  }
};

// Generic event logger function.
export const logEvent = (...args: unknown[]): void => {
  if (firebase.analytics) firebase.analytics().logEvent(...args);
};

export const logLogin = (method: string): void => {
  if (firebase.analytics) firebase.analytics().logEvent('login', { method });
};

export const logRegister = (method: string): void => {
  if (firebase.analytics) firebase.analytics().logEvent('sign_up', { method });
};

export const setPageView = (screenName: string): void => {
  if (firebase.analytics) firebase.analytics().setCurrentScreen(screenName);
};

export const logPageView = (): void => {
  if (firebase.analytics) firebase.analytics().logEvent('page_view');
};

export const setUserId = (id: string, options: unknown): void => {
  if (firebase.analytics) firebase.analytics().setUserId(id, options);
};
