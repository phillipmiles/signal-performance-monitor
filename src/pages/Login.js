/** @jsx jsx */
import { jsx } from 'theme-ui';
import PropTypes from 'prop-types';
import Paragraph from '../components/Paragraph';
import Input from '../components/Input';
import Link from '../components/Link';

const Login = ({
  email,
  password,
  onLogin,
  onChangePassword,
  onChangeEmail,
  emailError,
  passwordError,
  formError,
  isSigningIn,
  forgotPasswordUrl,
}) => {
  return (
    <div>
      <div>
        <h1>Login</h1>
        <form onSubmit={onLogin}>
          <label>
            email
            <Input type="text" onChange={onChangeEmail} value={email} />
            {emailError && <Paragraph>{emailError}</Paragraph>}
          </label>
          <label>
            password
            <Input
              type="password"
              onChange={onChangePassword}
              value={password}
            />
            {passwordError && <Paragraph>{passwordError}</Paragraph>}
          </label>
          <Link to={forgotPasswordUrl}>Forgot password?</Link>
          <input type="submit" value="Login" />
          {formError && <Paragraph>{formError}</Paragraph>}
          {isSigningIn && <Paragraph>Loading</Paragraph>}
        </form>
      </div>
    </div>
  );
};

Login.propTypes = {
  email: PropTypes.string,
  password: PropTypes.string,
  onLogin: PropTypes.func,
  onChangePassword: PropTypes.func,
  onChangeEmail: PropTypes.func,
  emailError: PropTypes.string,
  passwordError: PropTypes.string,
  formError: PropTypes.string,
  isSigningIn: PropTypes.bool,
  forgotPasswordUrl: PropTypes.string,
};

export default Login;
