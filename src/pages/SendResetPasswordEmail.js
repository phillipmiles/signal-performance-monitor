/** @jsx jsx */
import { jsx } from 'theme-ui';
import PropTypes from 'prop-types';
import Paragraph from '../components/Paragraph';
import Input from '../components/Input';

const SendResetPasswordEmail = ({
  email,
  onResetPassword,
  onChangeEmail,
  emailError,
  formError,
  isLoading,
}) => {
  return (
    <div>
      <div>
        <h1>Reset Password</h1>
        <form onSubmit={onResetPassword}>
          <label>
            email
            <Input type="text" onChange={onChangeEmail} value={email} />
            {emailError && <Paragraph>{emailError}</Paragraph>}
          </label>
          <input type="submit" value="ResetPassword" />
          {formError && <Paragraph>{formError}</Paragraph>}
          {isLoading && <Paragraph>Loading</Paragraph>}
        </form>
      </div>
    </div>
  );
};

SendResetPasswordEmail.propTypes = {
  email: PropTypes.string,
  onResetPassword: PropTypes.func,
  onChangeEmail: PropTypes.func,
  emailError: PropTypes.string,
  formError: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default SendResetPasswordEmail;
