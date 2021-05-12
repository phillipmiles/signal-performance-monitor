/** @jsx jsx */
import { jsx } from 'theme-ui';
import SendUpdateEmailEmail from './SendUpdateEmailEmail';
import { useCallback } from 'react';
import useForm from '../hooks/useForm';
import { useDispatch, useSelector } from 'react-redux';
import { sendChangeEmailEmail } from '../redux/user/user.actions';
import {
  getSendResetPasswordEmailError,
  getSendResetPasswordEmailLoading,
} from '../redux/user/user.selectors';
import { firebaseErrorCodes } from '../errors/errorCodes';

const formValidationRules = {
  newEmail: [
    {
      rule: 'hasMinLength',
      param: 1,
      errorMsg: 'Please enter a valid email address.',
    },
    {
      rule: 'isEmail',
      errorMsg: 'Please enter a valid email address.',
    },
  ],
};

const verifyPasswordValidationRules = {
  password: [
    {
      rule: 'hasMinLength',
      param: 7,
      errorMsg: 'Password must be at least 7 characters long. ',
    },
  ],
};

const verifyPasswordInitValues = {
  password: '',
};

const formInitValues = {
  newEmail: '',
};

const SendUpdateEmailEmailContainer = () => {
  const dispatch = useDispatch();
  // const sendResetPasswordEmailLoading = useSelector(
  //   getSendResetPasswordEmailLoading,
  // );
  // const sendResetPasswordEmailError = useSelector(
  //   getSendResetPasswordEmailError,
  // );

  const verifyPasswordOnSubmit = useCallback(
    ({ inputValues }) => {
      const asyncVerifyPassword = async () => {
        console.log('testy');
        // await dispatch(sendResetPasswordEmail(inputValues.email));
      };
      asyncVerifyPassword();
    },
    [dispatch],
  );

  const {
    formState: verifyPasswordFormState,
    handleChange: handleVerifyPasswordChange,
    handleSubmit: handleVerifyPasswordSubmit,
  } = useForm(
    verifyPasswordInitValues,
    verifyPasswordOnSubmit,
    verifyPasswordValidationRules,
  );

  const formOnSubmit = useCallback(
    ({ inputValues }) => {
      const submit = async () => {
        const response = await dispatch(
          sendChangeEmailEmail(inputValues.newEmail),
        );

        if (response.error) {
          if (
            response.error.code ===
            firebaseErrorCodes.AUTH__REQUIRES_RECENT_LOGIN
          ) {
            console.log('LETS GO AND REAUTHENTICATE!!!');
          }
          console.log(response.error);
        } else {
          console.log('LETS GO AND SAY WE SENT AN EMAIL!!!');
        }
      };
      submit();
    },
    [dispatch],
  );

  const { formState, handleChange, handleSubmit } = useForm(
    formInitValues,
    formOnSubmit,
    formValidationRules,
  );

  const handleChangeNewEmail = useCallback(
    (event) => handleChange('newEmail', event.target.value),

    [handleChange],
  );

  const handleChangePassword = useCallback(
    (event) => handleVerifyPasswordChange('password', event.target.value),

    [handleVerifyPasswordChange],
  );

  return (
    <SendUpdateEmailEmail
      password={verifyPasswordFormState.inputValues.password}
      onSubmitVerifyPassword={handleVerifyPasswordSubmit}
      onChangePassword={handleChangePassword}
      passwordError={
        verifyPasswordFormState.hasSubmitted
          ? verifyPasswordFormState.inputErrorMessages.password[0]
          : ''
      }
      newEmail={formState.inputValues.newEmail}
      onSubmitNewEmail={handleSubmit}
      onChangeNewEmail={handleChangeNewEmail}
      // isLoading={sendResetPasswordEmailLoading}
      newEmailError={
        formState.hasSubmitted ? formState.inputErrorMessages.newEmail[0] : ''
      }
      // formError={formState.hasSubmitted ? sendResetPasswordEmailError : ''}
    />
  );
};

export default SendUpdateEmailEmailContainer;
