/** @jsx jsx */
import { jsx } from 'theme-ui';
import Home from './Home';
import { Suspense, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import { signalsState } from '../state/signals';
import ActivityIndicator from '../components/ActivityIndicator';

const HomeContainer = () => {
  const signals = useRecoilValue(signalsState);
  console.log(signals);
  return <Home signals={signals} />;
};

const Loading = () => (
  // <ErrorBoundary>
  <Suspense fallback={<ActivityIndicator />}>
    <HomeContainer />
  </Suspense>
  // </ErrorBoundary>
);

export default Loading;
