/** @jsx jsx */
import PropTypes from 'prop-types';
import { jsx } from 'theme-ui';

const Text = ({ variant, overflow, ...props }) => {
  return (
    <span
      {...props}
      sx={{
        variant: `text.${variant}`,
        ...(overflow === 'ellipsis' && {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'inline-block',
        }),
      }}
    />
  );
};

Text.propTypes = {
  variant: PropTypes.oneOf(['body', 'callout', 'detail']),
  overflow: PropTypes.oneOf(['ellipsis']),
};

Text.defaultProps = {
  variant: 'body',
};

export default Text;
