import firebase from '../../services/firebase';
import env from '../../../env';

export const createUserWithEmailAndPassword = (email, password) =>
  firebase.auth().createUserWithEmailAndPassword(email, password);

export const signInWithEmailAndPassword = (email, password) =>
  firebase.auth().signInWithEmailAndPassword(email, password);

export const fetchSignInMethodsForEmail = (email) =>
  firebase.auth().fetchSignInMethodsForEmail(email);

export const signOut = () => firebase.auth().signOut();

export const sendVerificationEmail = (): Promise<void> => {
  return firebase.auth().currentUser.sendEmailVerification({
    handleCodeInApp: true,
    url: env.CONTINUE_LINK_VERIFY_EMAIL,
  });
};

export const sendPasswordResetEmail = (email) => {
  return firebase.auth().sendPasswordResetEmail(email, {
    handleCodeInApp: true,
    url: env.CONTINUE_LINK_RESET_PASSWORD,
  });
};

export const sendChangeEmailEmail = (newEmail: string): void => {
  return firebase.auth().currentUser.updateEmail(newEmail);
};

export const currentUser = () => firebase.auth().currentUser;
export const reloadUser = (): Promise<void> =>
  firebase.auth().currentUser.reload();

export const Operations = {
  EMAIL_SIGNIN: 'EMAIL_SIGNIN',
  PASSWORD_RESET: 'PASSWORD_RESET',
  RECOVER_EMAIL: 'RECOVER_EMAIL',
  REVERT_SECOND_FACTOR_ADDITION: 'REVERT_SECOND_FACTOR_ADDITION',
  VERIFY_AND_CHANGE_EMAIL: 'VERIFY_AND_CHANGE_EMAIL',
  VERIFY_EMAIL: 'VERIFY_EMAIL',
};

// https://firebase.google.com/docs/reference/js/firebase.auth.ActionCodeInfo
interface ActionCodeInfo {
  operation: string;
  data: {
    email: string;
    previousEmail: string;
    multiFactorInfo: unknown;
  };
}

export const checkActionCode = (actionCode: string): Promise<ActionCodeInfo> =>
  firebase.auth().checkActionCode(actionCode);

export const applyActionCode = (actionCode: string) =>
  firebase.auth().applyActionCode(actionCode);

export const confirmPasswordReset = (
  actionCode: string,
  newPassword: string,
): Promise<void> =>
  firebase.auth().confirmPasswordReset(actionCode, newPassword);
