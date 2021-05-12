/** @jsx jsx */
import PropTypes from 'prop-types';
import { jsx } from 'theme-ui';

// By default the variant is implied by the element.
const defaultVariantMap = {
  h1: 'heading1',
  h2: 'heading2',
  h3: 'heading3',
  h4: 'heading4',
  h5: 'heading5',
  h6: 'heading6',
};

const Heading = ({ variant, overflow, as: Element, ...props }) => {
  return (
    <Element
      {...props}
      sx={{
        variant: `text.${variant || defaultVariantMap[Element]}`,
        ...(overflow === 'ellipsis' && {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }),
      }}
    />
  );
};

Heading.propTypes = {
  as: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']).isRequired,
  variant: PropTypes.oneOf([
    'heading1',
    'heading2',
    'heading3',
    'heading4',
    'heading5',
    'heading6',
  ]),
  overflow: PropTypes.oneOf(['none', 'ellipsis']),
};

export default Heading;
