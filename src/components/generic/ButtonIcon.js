/** @jsx jsx */
import PropTypes from 'prop-types';
import { jsx } from 'theme-ui';
import Icon from './Icon';

const ButtonIcon = ({
  variant,
  icon,
  disabled,
  size,
  ariaLabel,
  selected,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled}
      aria-label={ariaLabel}
      sx={{
        display: 'inline-block',
        width: size,
        height: size,
        outline: 'none',
        flexShrink: 0,
        position: 'relative',
        cursor: disabled ? 'default' : 'pointer',
        bg: 'transparent',
        border: 'none',
        color: selected ? 'white' : 'neutral.7',
        borderRadius: 4,
        ':hover': {
          bg: 'black',
        },

        // Fixes Chrome issue where the onMouseLeave listener wont fire on the parent element when
        // the button had the 'disabled' attribute. https://github.com/facebook/react/issues/4492
        // and https://github.com/facebook/react/issues/4251
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      <Icon icon={icon} size={size} sx={{ color: 'inherit' }} />
    </button>
  );
};

{
  /* <Icon
icon={faChartBar}
sx={{
  color: 'white',
  width: '24px !important',
  height: '24px',
}}
/> */
}
// ButtonIcon.propTypes = {
//   variant: PropTypes.oneOf(['light', 'dark']),
//   /** A React component that renders inline SVG. */
//   icon: PropTypes.func.isRequired,
//   disabled: PropTypes.bool,
//   size: PropTypes.number,
//   /** Text describing the button's action to be read by screen readers. */
//   ariaLabel: PropTypes.string.isRequired,
// };

ButtonIcon.defaultProps = {
  variant: 'dark',
  disabled: false,
  size: 4,
};

export default ButtonIcon;
