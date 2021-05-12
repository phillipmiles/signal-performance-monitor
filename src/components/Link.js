/** @jsx jsx */
import PropTypes from 'prop-types';
import { jsx } from 'theme-ui';
import { Link as RRLink } from 'react-router-dom';

const Link = ({ ...props }) => {
  return <RRLink {...props} />;
};

Link.propTypes = {};

export default Link;
