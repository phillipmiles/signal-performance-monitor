/** @jsx jsx */
import { jsx } from 'theme-ui';
import Register from './Register';
import { useCallback } from 'react';
import useForm from '../hooks/useForm';
import useRouteTo from '../hooks/useRouteTo';
import { useLocation } from 'react-router-dom';
import routeUrls from '../router/routeUrls';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../redux/user/user.actions';
import {
  getRegisterUserLoading,
  getRegisterUserError,
} from '../redux/user/user.selectors';

const formValidationRules = (values) => ({
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
  passwordRepeat: [
    {
      rule: 'isEqualTo',
      param: values.password,
      errorMsg: "Your passwords don't match.",
    },
    {
      rule: 'hasMinLength',
      param: 1,
      errorMsg: 'Please re-enter your password.',
    },
  ],
});

const formInitValues = {
  email: '',
  password: '',
  passwordRepeat: '',
};

const RegisterContainer = () => {
  const routeTo = useRouteTo();
  const location = useLocation();
  const dispatch = useDispatch();
  const { from } = location.state || { from: { pathname: routeUrls.home } };
  const registerUserError = useSelector(getRegisterUserError);
  const registerUserLoading = useSelector(getRegisterUserLoading);

  const formOnSubmit = useCallback(
    ({ inputValues }) => {
      const asyncRegisterUser = async () => {
        const { error } = await dispatch(
          registerUser(inputValues.email, inputValues.password),
        );

        if (error) {
          return;
        }
        routeTo.replace(from);
      };
      asyncRegisterUser();
    },
    [dispatch, routeTo, from],
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

  const handleChangePasswordRepeat = useCallback(
    (event) => handleChange('passwordRepeat', event.target.value),
    [handleChange],
  );

  return (
    <Register
      email={formState.inputValues.email}
      password={formState.inputValues.password}
      onRegister={handleSubmit}
      onChangePassword={handleChangePassword}
      onChangePasswordRepeat={handleChangePasswordRepeat}
      onChangeEmail={handleChangeEmail}
      isSigningIn={registerUserLoading}
      emailError={
        formState.hasSubmitted ? formState.inputErrorMessages.email[0] : ''
      }
      passwordError={
        formState.hasSubmitted ? formState.inputErrorMessages.password[0] : ''
      }
      passwordRepeatError={
        formState.hasSubmitted
          ? formState.inputErrorMessages.passwordRepeat[0]
          : ''
      }
      formError={formState.hasSubmitted ? registerUserError : ''}
    />
  );
};

export default RegisterContainer;
