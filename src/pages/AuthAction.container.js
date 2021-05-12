/** @jsx jsx */
import { jsx } from 'theme-ui';
import { useEffect } from 'react';
import useQueryParams from '../hooks/useQueryParams';
import AuthAction from './AuthAction';
import {
  getCheckAuthActionCodeLoading,
  getCheckAuthActionCodeError,
} from '../redux/user/user.selectors';
import { useDispatch, useSelector } from 'react-redux';
import useRouteTo from '../hooks/useRouteTo';
import routeUrls from '../router/routeUrls';
import { checkAuthActionCode } from '../redux/user/user.actions';

const AuthActionContainer = () => {
  const checkAuthActionCodeLoading = useSelector(getCheckAuthActionCodeLoading);
  const checkAuthActionCodeError = useSelector(getCheckAuthActionCodeError);
  const queryParams = useQueryParams();
  const dispatch = useDispatch();
  const routeTo = useRouteTo();

  const oobCode = queryParams.get('oobCode');
  // const apiKey = queryParams.get('apiKey');
  // const mode = queryParams.get('mode');
  // const continueUrl = queryParams.get('continueUrl');

  useEffect(() => {
    const checkAsync = async () => {
      if (oobCode) {
        const { response, error } = await dispatch(
          checkAuthActionCode(oobCode),
        );
        if (!response || error) {
          return;
        }

        // We don't actually use the continue URL. Instead we read the operation and route
        // based off of that.
        switch (response.operation) {
          case 'PASSWORD_RESET':
            routeTo.push({
              pathname: routeUrls.resetPassword,
              state: { actionCode: oobCode },
            });
            break;
          case 'VERIFY_EMAIL':
            routeTo.push({
              pathname: routeUrls.verifyEmail,
              state: { actionCode: oobCode },
            });
            break;
          default:
          // Not good
        }
      }
    };

    checkAsync();
  }, [dispatch, oobCode, routeTo]);

  return (
    <AuthAction
      loading={checkAuthActionCodeLoading}
      error={checkAuthActionCodeError}
    />
  );
};

AuthActionContainer.propTypes = {};

export default AuthActionContainer;
