/** @jsx jsx */
import { jsx } from 'theme-ui';
import Login from './Login';
import { useSignInAsyncController } from '../redux/user/user.controllers';
import { useCallback } from 'react';
import useForm from '../hooks/useForm';
import useRouteTo from '../hooks/useRouteTo';
import { useLocation } from 'react-router-dom';
import routeUrls from '../router/routeUrls';

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
  password: [
    {
      rule: 'hasMinLength',
      param: 7,
      errorMsg: 'Password must be at least 7 characters long. ',
    },
  ],
};

const formInitValues = {
  email: '',
  password: '',
};

const LoginContainer = () => {
  const routeTo = useRouteTo();
  const location = useLocation();
  const { from } = location.state || { from: { pathname: routeUrls.home } };
  const [
    signIn,
    isSigningIn,
    signInError,
    // clearSignInError,
  ] = useSignInAsyncController();

  const formOnSubmit = useCallback(
    ({ inputValues }) => {
      const asyncLogin = async () => {
        try {
          await signIn({
            email: inputValues.email,
            password: inputValues.password,
          });
          routeTo.replace(from);
        } catch (error) {
          // do nothing
        }
      };
      asyncLogin();
    },
    [signIn, routeTo, from],
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

  const handleChangePassword = useCallback(
    (event) => handleChange('password', event.target.value),
    [handleChange],
  );

  return (
    <Login
      email={formState.inputValues.email}
      password={formState.inputValues.password}
      onLogin={handleSubmit}
      onChangePassword={handleChangePassword}
      onChangeEmail={handleChangeEmail}
      isSigningIn={isSigningIn}
      emailError={
        formState.hasSubmitted ? formState.inputErrorMessages.email[0] : ''
      }
      passwordError={
        formState.hasSubmitted ? formState.inputErrorMessages.password[0] : ''
      }
      formError={formState.hasSubmitted ? signInError : ''}
      forgotPasswordUrl={routeUrls.requestPasswordReset}
    />
  );
};

export default LoginContainer;
