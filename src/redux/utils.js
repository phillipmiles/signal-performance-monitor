import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { reportError } from '../errors/handleError';

// XXX TODO: Consider using https://redux-toolkit.js.org/api/createAction to help
// reduce some boilerplate code.

// https://redux.js.org/recipes/reducing-boilerplate
export const makeActionCreator = (type, ...argNames) => {
  return (...args) => {
    const action = { type };
    argNames.forEach((arg, index) => {
      action[argNames[index]] = args[index];
    });
    return action;
  };
};

// Redux suggests creating a middleware to do the same thing. Might be worth
// doing. See https://redux.js.org/recipes/reducing-boilerplate
export const createAsyncThunk = (actions, asyncFunc) => {
  return async (dispatch, getState, extra) => {
    try {
      dispatch(actions.begin());
      const response = await asyncFunc(dispatch, getState, extra);

      return dispatch(actions.success(response, dispatch, getState, extra));
    } catch (error) {
      reportError(error);
      dispatch(actions.error(error, dispatch, getState, extra));

      // Rethrow the original error so place of dispatch can make use of it in a try/catch block and
      // change the calling function's flow .
      throw error;
    }
  };
};

// Creates a hook for use with Redux asyncronous actions. Returns
// a function to trigger the action, a loading boolean value, any
// error messages and a function to clear the error.
export const useAsyncController = (
  asyncAction,
  loadingSelector,
  errorSelector,
  applyErrorAction,
) => {
  const dispatch = useDispatch();
  const loading = useSelector(loadingSelector);
  const error = useSelector(errorSelector);

  const resetError = useCallback(() => {
    dispatch(applyErrorAction(''));
  }, [dispatch, applyErrorAction]);

  const run = useCallback(
    (args) => {
      return dispatch(asyncAction(args));
    },
    [dispatch, asyncAction],
  );

  return [run, loading, error, resetError];
};

export const asyncLoadingReducer = (requestId, successId, errorId) => {
  return (state = false, action) => {
    switch (action.type) {
      case requestId:
        return true;
      case successId:
      case errorId:
        return false;
      default:
        return state;
    }
  };
};

export const asyncErrorReducer = (requestId, successId, errorId) => {
  return (state = '', action) => {
    switch (action.type) {
      case errorId:
        if (action.error.message) {
          return action.error.message;
        } else {
          return action.error;
        }
      case successId:
      case requestId:
        return '';
      default:
        return state;
    }
  };
};

export const createAsyncReducers = (requestId, successId, errorId) => {
  return {
    loading: asyncLoadingReducer(requestId, successId, errorId),
    error: asyncErrorReducer(requestId, successId, errorId),
  };
};

export const createAsyncSystem = (id, asyncAction, middleware) => {
  const requestId = `${id}_REQUEST`;
  const successId = `${id}_SUCCESS`;
  const errorId = `${id}_ERROR`;

  const actions = {
    request: makeActionCreator(requestId),
    success: makeActionCreator(successId, 'data'),
    error: makeActionCreator(errorId, 'error'),
  };

  // Checks if any middleware should be called before the action specified
  // by actionId.
  const wrapActionWithMiddleware = (actionId) => {
    return middleware && middleware[actionId]
      ? (...args) => {
          return actions[actionId](middleware[actionId](...args));
        }
      : actions[actionId];
  };

  const asyncThunk = (...args) => {
    return createAsyncThunk(
      {
        begin: wrapActionWithMiddleware('request'),
        success: wrapActionWithMiddleware('success'),
        error: wrapActionWithMiddleware('error'),
      },
      // Any arguments passed into the main action will be appended to the available thunk
      // arguments dispatch and getState. With redux thunk it's possible to inject a
      // custom global argument this is available in the extra's param.
      // See https://github.com/reduxjs/redux-thunk#injecting-a-custom-argument
      (dispatch, getState, extra) =>
        asyncAction(dispatch, getState, extra, ...args),
    );
  };

  const reducers = {
    loading: asyncLoadingReducer(requestId, successId, errorId),
    error: asyncErrorReducer(requestId, successId, errorId),
  };

  return {
    actions: {
      main: asyncThunk,
      ...actions,
    },
    types: {
      request: requestId,
      success: successId,
      error: errorId,
    },
    reducers: reducers,
  };
};
