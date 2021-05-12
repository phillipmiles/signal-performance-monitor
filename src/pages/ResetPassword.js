/** @jsx jsx */
import { jsx } from 'theme-ui';
import PropTypes from 'prop-types';
import Paragraph from '../components/Paragraph';

const ResetPassword = ({
  password,
  passwordRepeat,
  onResetPassword,
  onChangePassword,
  onChangePasswordRepeat,
  passwordError,
  passwordRepeatError,
  formError,
  isLoading,
  isResetSuccessful,
  onGoToLogin,
}) => {
  return (
    <div>
      <div>
        <h1>Reset password</h1>
        {isResetSuccessful ? (
          <div>
            <Paragraph>Your password has been updated.</Paragraph>
            <button onClick={onGoToLogin}>Go to login</button>
          </div>
        ) : (
          <form onSubmit={onResetPassword}>
            <label>
              password
              <input
                type="password"
                onChange={onChangePassword}
                value={password}
              />
              {passwordError && <Paragraph>{passwordError}</Paragraph>}
            </label>
            <label>
              Repeat password
              <input
                type="password"
                onChange={onChangePasswordRepeat}
                value={passwordRepeat}
              />
              {passwordRepeatError && (
                <Paragraph>{passwordRepeatError}</Paragraph>
              )}
            </label>
            <input type="submit" value="Reset password" />
            {formError && <Paragraph>{formError}</Paragraph>}
            {isLoading && <Paragraph>Loading</Paragraph>}
          </form>
        )}
      </div>
    </div>
  );
};

ResetPassword.propTypes = {
  password: PropTypes.string,
  passwordRepeat: PropTypes.string,
  onResetPassword: PropTypes.func,
  onChangePassword: PropTypes.func,
  onChangePasswordRepeat: PropTypes.func,
  passwordError: PropTypes.string,
  passwordRepeatError: PropTypes.string,
  formError: PropTypes.string,
  isLoading: PropTypes.bool,
  isResetSuccessful: PropTypes.bool,
  onGoToLogin: PropTypes.func,
};

export default ResetPassword;
