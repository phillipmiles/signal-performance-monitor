import {
  signIn,
  signInError,
  signOut,
  signOutError,
  verifyEmail,
  verifyEmailError,
  sendEmailVerification,
  sendEmailVerificationError,
} from './user.actions';
import {
  getSignInLoading,
  getSignInError,
  getSignOutLoading,
  getSignOutError,
  getVerifyEmailLoading,
  getVerifyEmailError,
  getSendEmailVerificationLoading,
  getSendEmailVerificationError,
} from './user.selectors';
import { useAsyncController } from '../utils';

export const useSignInAsyncController = () =>
  useAsyncController(signIn, getSignInLoading, getSignInError, signInError);

export const useSignOutAsyncController = () =>
  useAsyncController(signOut, getSignOutLoading, getSignOutError, signOutError);

export const useVerifyEmailAsyncController = () =>
  useAsyncController(
    verifyEmail,
    getVerifyEmailLoading,
    getVerifyEmailError,
    verifyEmailError,
  );

export const useSendEmailVerificationAsyncController = () =>
  useAsyncController(
    sendEmailVerification,
    getSendEmailVerificationLoading,
    getSendEmailVerificationError,
    sendEmailVerificationError,
  );
