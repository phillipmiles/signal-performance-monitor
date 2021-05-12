/** @jsx jsx */
import { jsx } from 'theme-ui';
import SendResetPasswordEmail from './SendResetPasswordEmail';
import { useCallback } from 'react';
import useForm from '../hooks/useForm';
import { useDispatch, useSelector } from 'react-redux';
import { sendResetPasswordEmail } from '../redux/user/user.actions';
import {
  getSendResetPasswordEmailError,
  getSendResetPasswordEmailLoading,
} from '../redux/user/user.selectors';

const formValidationRules = {
  email: [
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

const formInitValues = {
  email: '',
};

const SendResetPasswordEmailContainer = () => {
  const dispatch = useDispatch();
  const sendResetPasswordEmailLoading = useSelector(
    getSendResetPasswordEmailLoading,
  );
  const sendResetPasswordEmailError = useSelector(
    getSendResetPasswordEmailError,
  );

  const formOnSubmit = useCallback(
    ({ inputValues }) => {
      const submit = async () => {
        await dispatch(sendResetPasswordEmail(inputValues.email));
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

  const handleChangeEmail = useCallback(
    (event) => handleChange('email', event.target.value),

    [handleChange],
  );

  return (
    <SendResetPasswordEmail
      email={formState.inputValues.email}
      onResetPassword={handleSubmit}
      onChangeEmail={handleChangeEmail}
      isLoading={sendResetPasswordEmailLoading}
      emailError={
        formState.hasSubmitted ? formState.inputErrorMessages.email[0] : ''
      }
      formError={formState.hasSubmitted ? sendResetPasswordEmailError : ''}
    />
  );
};

export default SendResetPasswordEmailContainer;
