import { useCallback, useEffect } from 'react';
import { logPageView, setPageView } from '../services/analytics';
import { History } from 'history';

const useLogPageView = (history: History): void => {
  const updatePageView = useCallback((location) => {
    setPageView(location && location.pathname ? location.pathname : 'unknown');
    logPageView();
  }, []);

  useEffect(() => {
    updatePageView(history.location);
  }, [history, updatePageView]);

  useEffect(() => {
    const unListen = history.listen((location) => {
      updatePageView(location);
    });

    return () => {
      unListen();
    };
  }, [history, updatePageView]);
};

export default useLogPageView;
