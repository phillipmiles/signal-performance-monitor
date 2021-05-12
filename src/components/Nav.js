/** @jsx jsx */
import { jsx } from 'theme-ui';
import { useSignOutAsyncController } from '../redux/user/user.controllers';
import { useCallback, Fragment } from 'react';
import NavItem from './NavItem';
import useRouteTo from '../hooks/useRouteTo';
import routeUrls from '../router/routeUrls';
import { useSelector } from 'react-redux';
import { getAuthUser } from '../redux/user/user.selectors';
import { getHasAttemptedAuth } from '../redux/auth/auth.selectors';

const Nav = () => {
  const routeTo = useRouteTo();

  const authState = useSelector(getAuthUser);
  const hasAttemptedAuth = useSelector(getHasAttemptedAuth);
  const [signOut] = useSignOutAsyncController();

  const handleSignOut = useCallback(() => {
    const asyncSignOut = async () => {
      try {
        await signOut();
        routeTo.push(routeUrls.home);
      } catch (err) {
        // Do nothing
      }
    };

    asyncSignOut();
  }, [routeTo, signOut]);

  return (
    <nav>
      <ul>
        <li>
          <NavItem to={routeUrls.home}>Home</NavItem>
        </li>
        <li>
          <NavItem to={routeUrls.movies}>Movies</NavItem>
        </li>
        <li>
          <NavItem to={routeUrls.books}>Books</NavItem>
        </li>
        <li>
          <NavItem to={routeUrls.booksProtected}>Protected books</NavItem>
        </li>
        <li>
          <NavItem to={routeUrls.requestPasswordReset}>Reset Password</NavItem>
        </li>
        {hasAttemptedAuth && !authState && (
          <Fragment>
            <li>
              <NavItem to={routeUrls.login}>Login</NavItem>
            </li>
            <li>
              <NavItem to={routeUrls.register}>Register</NavItem>
            </li>
          </Fragment>
        )}
        {hasAttemptedAuth && !!authState && (
          <Fragment>
            <li>
              <NavItem to={routeUrls.requestUpdateEmail}>Update Email</NavItem>
            </li>
            <li>
              <NavItem onClick={handleSignOut}>Logout</NavItem>
            </li>
          </Fragment>
        )}
      </ul>
    </nav>
  );
};

// global error handling -
// protected route
export default Nav;
