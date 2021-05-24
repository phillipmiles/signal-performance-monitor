/** @jsx jsx */
import { jsx } from 'theme-ui';

const Menu = (props) => (
  <div
    {...props}
    sx={{
      display: 'inline-block',
      borderRadius: 'small',
      bg: 'white',
      whiteSpace: 'nowrap',
      width: 11,
    }}
  />
);

export default Menu;
