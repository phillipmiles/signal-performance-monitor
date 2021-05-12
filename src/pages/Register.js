/** @jsx jsx */
import { jsx } from 'theme-ui';
import PropTypes from 'prop-types';
import Paragraph from '../components/Paragraph';

const Register = ({
  email,
  password,
  passwordRepeat,
  onRegister,
  onChangeEmail,
  onChangePassword,
  onChangePasswordRepeat,
  emailError,
  passwordError,
  passwordRepeatError,
  formError,
  isRegistering,
}) => {
  return (
    <div>
      <div>
        <h1>Register</h1>
        <form onSubmit={onRegister}>
          <label>
            email
            <input type="text" onChange={onChangeEmail} value={email} />
            {emailError && <Paragraph>{emailError}</Paragraph>}
          </label>
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
          <input type="submit" value="Register" />
          {formError && <Paragraph>{formError}</Paragraph>}
          {isRegistering && <Paragraph>Loading</Paragraph>}
        </form>
      </div>
    </div>
  );
};

Register.propTypes = {
  email: PropTypes.string,
  password: PropTypes.string,
  passwordRepeat: PropTypes.string,
  onRegister: PropTypes.func,
  onChangePassword: PropTypes.func,
  onChangePasswordRepeat: PropTypes.func,
  onChangeEmail: PropTypes.func,
  emailError: PropTypes.string,
  passwordError: PropTypes.string,
  passwordRepeatError: PropTypes.string,
  formError: PropTypes.string,
  isRegistering: PropTypes.bool,
};

export default Register;
