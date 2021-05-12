/** @jsx jsx */
import { jsx } from 'theme-ui';
import { useCallback, useEffect, useState } from 'react';
import VerifyEmail from './VerifyEmail';
import {
  useSendEmailVerificationAsyncController,
  useVerifyEmailAsyncController,
} from '../redux/user/user.controllers';
import { getAuthUser } from '../redux/user/user.selectors';
import { useSelector } from 'react-redux';
import useRouteTo from '../hooks/useRouteTo';
import routeUrls from '../router/routeUrls';
import { useLocation } from 'react-router-dom';

const VerifyEmailContainer = () => {
  const authUser = useSelector(getAuthUser);
  const location = useLocation();
  const { actionCode } = location.state;
  const [hasVerified, setHasVerified] = useState(false);
  console.log('actionCode', actionCode);
  const routeTo = useRouteTo();

  const [
    verifyEmail,
    isVerifyEmailLoading,
    verifyEmailError,
    clearVerifyEmailError,
  ] = useVerifyEmailAsyncController();

  const [
    sendEmailVerification,
    isSendEmailVerificationLoading,
    sendEmailVerificationError,
    clearSendEmailVerificationError,
  ] = useSendEmailVerificationAsyncController();

  useEffect(() => {
    const verifyAsync = async () => {
      try {
        await verifyEmail(actionCode);
        setHasVerified(true);
      } catch (error) {
        // Do nothing
      }
    };

    verifyAsync();
  }, [verifyEmail, actionCode]);

  const handleResendVerificationEmail = useCallback(() => {
    const asyncSendEmailVerification = async () => {
      try {
        clearVerifyEmailError();
        clearSendEmailVerificationError();
        await sendEmailVerification();
      } catch (error) {
        // Do nothing
      }
    };

    if (authUser) {
      asyncSendEmailVerification();
    } else {
      routeTo.push({
        pathname: routeUrls.login,
        state: { from: location },
      });
    }
  }, [
    clearVerifyEmailError,
    sendEmailVerification,
    clearSendEmailVerificationError,
    authUser,
    routeTo,
    location,
  ]);

  return (
    <VerifyEmail
      isVerifySuccessful={hasVerified}
      isVerifying={isVerifyEmailLoading}
      isSendingEmailVerification={isSendEmailVerificationLoading}
      sendEmailVerificationError={sendEmailVerificationError}
      verifyEmailError={verifyEmailError}
      onClickResendVerificationEmail={handleResendVerificationEmail}
    />
  );
};

VerifyEmailContainer.propTypes = {};

export default VerifyEmailContainer;
