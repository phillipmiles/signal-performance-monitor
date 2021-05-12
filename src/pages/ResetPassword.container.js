/** @jsx jsx */
import { jsx } from 'theme-ui';
import ResetPassword from './ResetPassword';
import { useCallback } from 'react';
import useForm from '../hooks/useForm';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '../redux/user/user.actions';
import {
  getResetPasswordError,
  getResetPasswordLoading,
} from '../redux/user/user.selectors';
import useRouteTo from '../hooks/useRouteTo';
import routeUrls from '../router/routeUrls';

const formValidationRules = (values) => ({
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
  password: '',
  passwordRepeat: '',
};

const ResetPasswordContainer = () => {
  const location = useLocation();
  const routeTo = useRouteTo();
  const resetPasswordError = useSelector(getResetPasswordError);
  const resetPasswordLoading = useSelector(getResetPasswordLoading);
  const { actionCode } = location.state;
  const dispatch = useDispatch();

  const formOnSubmit = useCallback(
    ({ inputValues }) => {
      const submit = async () => {
        const { error } = await dispatch(
          resetPassword(actionCode, inputValues.password),
        );
        if (error) {
          return false;
        }
        return true;
      };
      return submit();
    },
    [dispatch, actionCode],
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
  const handleChangePasswordRepeat = useCallback(
    (event) => handleChange('passwordRepeat', event.target.value),
    [handleChange],
  );

  const handleGoToLogin = useCallback(() => {
    routeTo.push({
      pathname: routeUrls.login,
    });
  }, [routeTo]);

  return (
    <ResetPassword
      password={formState.inputValues.password}
      passwordRepeat={formState.inputValues.passwordRepeat}
      onResetPassword={handleSubmit}
      onChangePassword={handleChangePassword}
      onChangePasswordRepeat={handleChangePasswordRepeat}
      isLoading={resetPasswordLoading}
      passwordError={
        formState.hasSubmitted ? formState.inputErrorMessages.password[0] : ''
      }
      passwordRepeatError={
        formState.hasSubmitted
          ? formState.inputErrorMessages.passwordRepeat[0]
          : ''
      }
      formError={formState.hasSubmitted ? resetPasswordError : ''}
      onGoToLogin={handleGoToLogin}
      isResetSuccessful={formState.submitSuccess}
    />
  );
};

export default ResetPasswordContainer;
