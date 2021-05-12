/** @jsx jsx */
import { jsx } from 'theme-ui';
import ReauthenticateUser from './ReauthenticateUser';
import { useCallback } from 'react';
import useForm from '../hooks/useForm';
import { useDispatch, useSelector } from 'react-redux';
import { sendResetPasswordEmail } from '../redux/user/user.actions';
import {
  getSendResetPasswordEmailError,
  getSendResetPasswordEmailLoading,
} from '../redux/user/user.selectors';

const formValidationRules = {
  password: [
    {
      rule: 'hasMinLength',
      param: 7,
      errorMsg: 'Password must be at least 7 characters long. ',
    },
  ],
};

const formInitValues = {
  password: '',
};

const ReauthenticateUserContainer = () => {
  const dispatch = useDispatch();
  // const sendResetPasswordEmailLoading = useSelector(
  //   getSendResetPasswordEmailLoading,
  // );
  // const sendResetPasswordEmailError = useSelector(
  //   getSendResetPasswordEmailError,
  // );

  const formOnSubmit = useCallback(
    ({ inputValues }) => {
      const asyncVerifyPassword = async () => {
        console.log('testy');
        // await dispatch(sendResetPasswordEmail(inputValues.email));
        // Route to
      };
      asyncVerifyPassword();
    },
    [dispatch],
  );

  const { formState, handleChange, handleSubmit } = useForm(
    formInitValues,
    formOnSubmit,
    formValidationRules,
  );

  const handleChangePassword = useCallback(
    (event) => handleChange('password', event.target.value),

    [handleChange],
  );

  return (
    <ReauthenticateUser
      password={formState.inputValues.password}
      onSubmitVerifyPassword={handleSubmit}
      onChangePassword={handleChangePassword}
      passwordError={
        formState.hasSubmitted ? formState.inputErrorMessages.password[0] : ''
      }

      // isLoading={sendResetPasswordEmailLoading}

      // formError={formState.hasSubmitted ? sendResetPasswordEmailError : ''}
    />
  );
};

export default ReauthenticateUserContainer;
