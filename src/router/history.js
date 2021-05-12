import { createBrowserHistory } from 'history';

// Used to share history data between react router, google analytics and sentry error tracking.
const history = createBrowserHistory();

export default history;
