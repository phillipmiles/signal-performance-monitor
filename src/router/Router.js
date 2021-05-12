/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Router as RRRouter, Switch } from 'react-router-dom';
import loadable from '@loadable/component';
import ActivityIndicator from '../components/ActivityIndicator';
import Nav from '../components/Nav';
import GlobalError from '../components/GlobalError';
import Route from './Route';
import routeUrls from './routeUrls';
import ScrollToTop from './ScrollToTop';
import history from './history';
import useLogPageView from '../hooks/useLogPageView';
import UserDetails from '../components/UserDetails';

const Home = loadable(() => import('../pages/Home.container.js'), {
  fallback: <ActivityIndicator />,
});

const Books = loadable(() => import('../pages/Books.container'), {
  fallback: <ActivityIndicator />,
});

const Movies = loadable(() => import('../pages/Movies.container'), {
  fallback: <ActivityIndicator />,
});

const Login = loadable(() => import('../pages/Login.container'), {
  fallback: <ActivityIndicator />,
});

const Register = loadable(() => import('../pages/Register.container'), {
  fallback: <ActivityIndicator />,
});

const VerifyEmail = loadable(() => import('../pages/VerifyEmail.container'), {
  fallback: <ActivityIndicator />,
});

const ReauthenticateUser = loadable(
  () => import('../pages/ReauthenticateUser.container'),
  {
    fallback: <ActivityIndicator />,
  },
);

const SendUpdateEmailEmail = loadable(
  () => import('../pages/SendUpdateEmailEmail.container'),
  {
    fallback: <ActivityIndicator />,
  },
);

const AuthAction = loadable(() => import('../pages/AuthAction.container'), {
  fallback: <ActivityIndicator />,
});

const SendResetPasswordEmail = loadable(
  () => import('../pages/SendResetPasswordEmail.container'),
  {
    fallback: <ActivityIndicator />,
  },
);

const ResetPassword = loadable(
  () => import('../pages/ResetPassword.container'),
  {
    fallback: <ActivityIndicator />,
  },
);

const Router = () => {
  // Will listen for changes to the history location and send them to firebase
  // analytics as page_view events.
  useLogPageView(history);

  return (
    <RRRouter history={history}>
      <ScrollToTop />
      {/* <div sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Nav />
        <UserDetails />
      </div> */}
      <GlobalError />
      {/* Switch will match the first valid route. */}
      <Switch>
        <Route path={routeUrls.books}>
          <Books />
        </Route>
        <Route path={routeUrls.movies} type="defined">
          <Movies />
        </Route>
        <Route path={routeUrls.booksProtected} type="private">
          <Books />
        </Route>
        <Route path={routeUrls.login} type="public">
          <Login />
        </Route>
        <Route path={routeUrls.register} type="public">
          <Register />
        </Route>
        <Route path={routeUrls.authAction} type="defined">
          <AuthAction />
        </Route>
        <Route path={routeUrls.reauthenticateUser} type="private">
          <ReauthenticateUser />
        </Route>
        <Route path={routeUrls.requestUpdateEmail} type="private">
          <SendUpdateEmailEmail />
        </Route>
        <Route path={routeUrls.requestPasswordReset} type="defined">
          <SendResetPasswordEmail />
        </Route>
        <Route path={routeUrls.resetPassword} type="defined">
          <ResetPassword />
        </Route>
        <Route path={routeUrls.verifyEmail} type="defined">
          <VerifyEmail />
        </Route>
        <Route path={routeUrls.home}>
          <Home />
        </Route>
      </Switch>
    </RRRouter>
  );
};

export default Router;
