/** @jsx jsx */
import PropTypes from 'prop-types';
import { jsx, Flex } from 'theme-ui';

/** A wrapping component used to center and limit the width of any page content whilst
 * providing appropriate margin sizes for desktop and mobile devices. */

const ContentWrap = ({ children, maxWidth, ...props }) => {
  return (
    // Outer div used to set margins without reducing the maxWidth size.
    <Flex {...props} sx={{ px: [3, 4], flexDirection: 'column' }}>
      <Flex
        sx={{
          position: 'relative',
          maxWidth: maxWidth,
          width: '100%',
          mx: 'auto',
          flexGrow: 1,
          flexDirection: 'column',
        }}
      >
        {children}
      </Flex>
    </Flex>
  );
};

ContentWrap.propTypes = {
  children: PropTypes.node,
  maxWidth: PropTypes.string,
};

ContentWrap.defaultProps = {
  maxWidth: 'content',
};

export default ContentWrap;
