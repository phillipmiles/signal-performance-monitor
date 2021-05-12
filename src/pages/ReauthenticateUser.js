/** @jsx jsx */
import { jsx } from 'theme-ui';
import PropTypes from 'prop-types';
import Paragraph from '../components/Paragraph';
import Input from '../components/Input';

const SendUpdateEmailEmail = ({
  password,
  onSubmitVerifyPassword,
  onChangePassword,
  passwordError,
  formError,
  isLoading,
}) => {
  return (
    <div>
      <div>
        <h1>Verify password</h1>
        <form onSubmit={onSubmitVerifyPassword}>
          <label>
            Enter your password to continue.
            <Input
              type="password"
              onChange={onChangePassword}
              value={password}
            />
            {passwordError && <Paragraph>{passwordError}</Paragraph>}
          </label>
          <input type="submit" value="Verify password." />
          {formError && <Paragraph>{formError}</Paragraph>}
          {isLoading && <Paragraph>Loading</Paragraph>}
        </form>
      </div>
    </div>
  );
};

SendUpdateEmailEmail.propTypes = {
  password: PropTypes.string,
  onSubmitVerifyPassword: PropTypes.func,
  onChangePassword: PropTypes.func,
  passwordError: PropTypes.string,
  formError: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default SendUpdateEmailEmail;
