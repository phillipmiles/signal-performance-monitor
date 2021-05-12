import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import env from '../../env';
import envActive from '../../env.active';
import history from '../router/history';

Sentry.init({
  dsn: env.SENTRY_DSN,
  integrations: [
    new Integrations.BrowserTracing({
      // link in router history data.
      routingInstrumentation: Sentry.reactRouterV5Instrumentation(history),
    }),
  ],
  environment: envActive,
  release: process.env.npm_package_name + '@' + process.env.npm_package_version,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

export const sentryReduxEnhancer = Sentry.createReduxEnhancer({
  // Optionally pass options
});

export const captureException = (error) => Sentry.captureException(error);
