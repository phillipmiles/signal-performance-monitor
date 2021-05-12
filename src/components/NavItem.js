/** @jsx jsx */
import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { jsx } from 'theme-ui';
import useRouteTo from '../hooks/useRouteTo';

const NavItem = ({ to, onClick, ...props }) => {
  const routeTo = useRouteTo();

  const navigate = useCallback(() => {
    routeTo.push(to);
  }, [to, routeTo]);

  return <button {...props} onClick={to ? navigate : onClick} />;
};

NavItem.propTypes = {
  onClick: PropTypes.func,
  /** A route URL string that if passed will replace the onClick function with a function that
   * triggers a page route to the passed in url.
   */
  to: PropTypes.string,
};

export default NavItem;
