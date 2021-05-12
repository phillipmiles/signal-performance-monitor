import handleError from '../errors/handleError';

export const callAPIMiddleware = ({ dispatch, getState }) => {
  return (next) => (action) => {
    const { types, callAPI, shouldCallAPI = () => true, payload = {} } = action;

    if (!types) {
      // Normal action: pass it on
      return next(action);
    }

    if (
      !Array.isArray(types) ||
      types.length !== 3 ||
      !types.every((type) => typeof type === 'string')
    ) {
      throw new Error('Expected an array of three string types.');
    }

    if (typeof callAPI !== 'function') {
      throw new Error('Expected callAPI to be a function.');
    }

    if (!shouldCallAPI(getState())) {
      return;
    }

    const [requestType, successType, errorType] = types;

    dispatch(
      Object.assign({}, payload, {
        type: requestType,
      }),
    );

    return callAPI(dispatch, getState).then(
      (response) =>
        dispatch(
          Object.assign({}, payload, {
            response,
            type: successType,
          }),
        ),
      (error) => {
        error = handleError(error);
        console.log(error.type);
        // if (error.report) {
        //   error.report();
        //   // Any errors thrown from callAPI will be sent to sentry. If there are any errors that shouldn't
        //   // be reported then catch and handle them within callAPI function.
        //   // reportError(error);
        // }

        return dispatch(
          Object.assign({}, payload, {
            error: error,
            type: errorType,
          }),
        );
      },
    );
  };
};
