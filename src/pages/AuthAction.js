/** @jsx jsx */
import { jsx } from 'theme-ui';
import PropTypes from 'prop-types';
import Paragraph from '../components/Paragraph';

const AuthAction = ({ error, loading }) => {
  return (
    <div>
      <div>
        <h1>Auth action</h1>
        {error && <Paragraph>{error}</Paragraph>}
        {loading && <Paragraph>Loading</Paragraph>}
      </div>
    </div>
  );
};

AuthAction.propTypes = {
  error: PropTypes.string,
  loading: PropTypes.bool,
};

export default AuthAction;
