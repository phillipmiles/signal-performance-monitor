import firebase from '../services/firebase';
import { useCallback, useEffect, useState } from 'react';
import { setAuthUser } from '../redux/user/user.actions';
import { useDispatch } from 'react-redux';

// Will contact firebase to attempt to locate a signed in user. If located, the authenticated
// user's data will then be saved to the redux store. Hook will continue to listen to any changes
// in the user state coming from firebase and keeps redux in sync with any changes detected.
//
// Hook returns a boolean state indicating whether firebase has completed an initial check for an
// authenticated user. This is helpful in-case where we are waiting to check authentication during
// inital app loading before taking the user to the first screen.
//
// Hook is intended to be called once from the root app component and stay mounted throughout runtime.
//
// Hook listens to sign-in, sign-out and IDToken change events. ID tokens can be revoked through actions
// like updating user email.
// https://firebase.google.com/docs/reference/js/firebase.auth.Auth#onidtokenchanged
// This hook is a subset listener to both useOnFirebaseUserChange and useOnFirebaseAuthChange hook.
const useObserveAuthChanges = () => {
  const dispatch = useDispatch();
  const [isInitialised, setIsInitialised] = useState(false);

  // Handle user state changes
  const handleIDTokenChanged = useCallback(
    (user) => {
      dispatch(setAuthUser(user));
      setIsInitialised(true);
    },
    [dispatch],
  );

  useEffect(() => {
    const subscriber = firebase.auth().onIdTokenChanged(handleIDTokenChanged);
    return subscriber; // unsubscribe on unmount
  }, [handleIDTokenChanged]);

  return isInitialised;
};

export default useObserveAuthChanges;
