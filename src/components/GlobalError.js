/** @jsx jsx */
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { jsx } from 'theme-ui';
import { getGlobalErrorMessage } from '../redux/error/error.selectors';
import Paragraph from './Paragraph';
import { globalErrorMessage } from '../redux/error/error.actions';

const GlobalError = ({ ...props }) => {
  const errorMessage = useSelector(getGlobalErrorMessage);
  const dispatch = useDispatch();

  const handleAcknowledge = useCallback(() => {
    dispatch(globalErrorMessage(''));
  }, [dispatch]);

  if (errorMessage) {
    return (
      <div {...props}>
        <Paragraph>{errorMessage}</Paragraph>
        <button onClick={handleAcknowledge}>Okay</button>
      </div>
    );
  } else {
    return null;
  }
};

GlobalError.propTypes = {};

export default GlobalError;
