/** @jsx jsx */
import PropTypes from 'prop-types';
import { jsx } from 'theme-ui';
import ActivityIndicator from '../components/ActivityIndicator';
import Paragraph from '../components/Paragraph';

const VerifyEmail = ({
  isVerifying,
  isVerifySuccessful,
  isSendingEmailVerification,
  sendEmailVerificationError,
  verifyEmailError,
  onClickResendVerificationEmail,
}) => {
  return (
    <div>
      {isVerifySuccessful && (
        <Paragraph>Your email has been verified.</Paragraph>
      )}
      {(isVerifying || isSendingEmailVerification) && <ActivityIndicator />}
      {!!verifyEmailError && (
        <div>
          <Paragraph>{verifyEmailError}</Paragraph>
          <button onClick={onClickResendVerificationEmail}>
            Resend verification email
          </button>
        </div>
      )}
      {!!sendEmailVerificationError && (
        <div>
          <Paragraph>{sendEmailVerificationError}</Paragraph>
          <button onClick={onClickResendVerificationEmail}>
            Resend verification email
          </button>
        </div>
      )}
    </div>
  );
};

VerifyEmail.propTypes = {
  isVerifying: PropTypes.bool,
  isVerifySuccessful: PropTypes.bool,
  isSendingEmailVerification: PropTypes.bool,
  verifyEmailError: PropTypes.string,
  sendEmailVerificationError: PropTypes.string,
  onClickResendVerificationEmail: PropTypes.func,
};

export default VerifyEmail;
