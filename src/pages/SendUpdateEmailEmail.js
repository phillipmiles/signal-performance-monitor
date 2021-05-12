/** @jsx jsx */
import { jsx } from 'theme-ui';
import PropTypes from 'prop-types';
import Paragraph from '../components/Paragraph';
import Input from '../components/Input';

const SendUpdateEmailEmail = ({
  password,
  newEmail,
  onSubmitVerifyPassword,
  onSubmitNewEmail,
  onChangePassword,
  onChangeNewEmail,
  newEmailError,
  passwordError,
  formError,
  isLoading,
}) => {
  return (
    <div>
      <div>
        <h1>Update Email</h1>
        {/* {true ? (
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
        ) : ( */}
        <form onSubmit={onSubmitNewEmail}>
          <label>
            Enter your new email address
            <Input type="text" onChange={onChangeNewEmail} value={newEmail} />
            {newEmailError && <Paragraph>{newEmailError}</Paragraph>}
          </label>
          <input type="submit" value="Change email" />
          {formError && <Paragraph>{formError}</Paragraph>}
          {isLoading && <Paragraph>Loading</Paragraph>}
        </form>
        {/* )} */}
      </div>
    </div>
  );
};

SendUpdateEmailEmail.propTypes = {
  newEmail: PropTypes.string,
  onSubmitNewEmail: PropTypes.func,
  onChangeNewEmail: PropTypes.func,
  newEmailError: PropTypes.string,
  formError: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default SendUpdateEmailEmail;
