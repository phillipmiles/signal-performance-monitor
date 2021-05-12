import { useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import routeUrls from '../router/routeUrls';

const useRouteTo = () => {
  const history = useHistory();

  const getRouteUrl = useCallback((route) => {
    if (typeof route === 'string') {
      return routeUrls[route] ? routeUrls[route] : route;
    } else {
      return {
        pathname: routeUrls[route] ? routeUrls[route] : route,
        ...route,
      };
    }
  }, []);

  const push = useCallback(
    (route) => {
      history.push(getRouteUrl(route));
    },
    [history, getRouteUrl],
  );

  const replace = useCallback(
    (route) => {
      history.replace(getRouteUrl(route));
    },
    [history, getRouteUrl],
  );

  const routeTo = useMemo(() => {
    return {
      push,
      replace,
    };
  }, [push, replace]);

  return routeTo;
};

export default useRouteTo;
