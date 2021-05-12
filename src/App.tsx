/** @jsx jsx */
import { jsx } from 'theme-ui';
import ThemeProvider from './styles/ThemeProvider';
import Router from './router/Router';
import ReduxStore from './redux/ReduxStore';
import './services/firebase';
import './services/sentry';
import useObserveAuthChanges from './hooks/useObserveAuthChanges';
import { RecoilRoot } from 'recoil';

const AppInit = ({ children }): JSX.Element => {
  // Attempts to log in user from session data and continues to listen
  // to any changes to session authentication.
  useObserveAuthChanges();

  return children;
};

const App = (): JSX.Element => {
  return (
    <ReduxStore>
      <RecoilRoot>
        <ThemeProvider>
          <AppInit>
            <Router />
          </AppInit>
        </ThemeProvider>
      </RecoilRoot>
    </ReduxStore>
  );
};

export default App;
