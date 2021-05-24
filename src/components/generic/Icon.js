/** @jsx jsx */
import { jsx } from 'theme-ui';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';

const FontAwesomeIcon = ({ icon, size, ...props }) => {
  return (
    <FAIcon
      {...props}
      icon={icon}
      size="2x"
      // sx={{ width: '24px !important', height: size }}
    />
  );
};

export default FontAwesomeIcon;
