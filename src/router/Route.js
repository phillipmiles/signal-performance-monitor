/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Redirect, Route as RouterRoute } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { getAuthUser } from '../redux/user/user.selectors';
import routeUrls from './routeUrls';
import { getHasAttemptedAuth } from '../redux/auth/auth.selectors';
import { useCallback } from 'react';
import ActivityIndicator from '../components/ActivityIndicator';

// Defines a specific route. Can apply a type of public or private to force redirects
// based on whether the user is authenticated or not.
const Route = ({ children, type, ...props }) => {
  const authState = useSelector(getAuthUser);
  const hasAttemptedAuth = useSelector(getHasAttemptedAuth);

  const renderPublicScreen = useCallback(
    ({ location }) => {
      if (authState) {
        return (
          <Redirect
            to={{
              pathname: routeUrls.home,
              state: { from: location },
            }}
          />
        );
      } else {
        return children;
      }
    },
    [authState, children],
  );

  const renderPrivateScreen = useCallback(
    ({ location }) => {
      if (authState) {
        return children;
      } else {
        return (
          <Redirect
            to={{
              pathname: routeUrls.login,
              state: { from: location },
            }}
          />
        );
      }
    },
    [authState, children],
  );

  if (
    (type === 'private' || type === 'public' || type === 'defined') &&
    !hasAttemptedAuth
  ) {
    return <ActivityIndicator />;
  } else if (type === 'private') {
    return <RouterRoute {...props} render={renderPrivateScreen} />;
  } else if (type === 'public') {
    return <RouterRoute {...props} render={renderPublicScreen} />;
  } else {
    return <RouterRoute {...props}>{children}</RouterRoute>;
  }
};

Route.propTypes = {
  children: PropTypes.node,
  type: PropTypes.oneOf(['undefined', 'public', 'private', 'defined']),
};

Route.defaultProps = {
  type: 'undefined',
};

export default Route;
