/** @jsx jsx */
import PropTypes from 'prop-types';
import React, {
  Fragment,
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { jsx } from 'theme-ui';

/** Tether creates a portal for the ```tetherComponent``` to sit it outside the normal DOM structure.
 * It then positions the component relative to the Tether component's child component as defined
 * by ```sourceAnchorCoord``` and ```tetherAnchorCoord``` properties.
 *
 * __Further possible dev work:__
 *
 * - ```fitInViewport``` is a bit buggy in working out when to adjust position.
 * - There's a bug in the initial position calculated at first render.
 */

const Tether = ({
  children,
  tetherComponent,
  sourceAnchorCoord,
  tetherAnchorCoord,
  fitInViewport,
  shouldUpdatePosition,
  ...props
}) => {
  const [flippedX, setFlippedX] = useState(false);
  const [flippedY, setFlippedY] = useState(false);
  const sourceEl = useRef();
  const documentWindowEl = window;
  const tetherEl = useRef(document.createElement('div'));

  useEffect(() => {
    const element = tetherEl.current;
    element.style.position = 'absolute';
    document.body.appendChild(element);

    return () => {
      document.body.removeChild(element);
    };
  }, []);

  const convertElOriginToPixels = (origin, el) => {
    let convertedOrigin = [];

    for (const axis in origin) {
      const value = origin[axis];
      if (typeof value === 'number') {
        convertedOrigin.push(value);
      } else if (typeof value === 'string') {
        if (value.indexOf('%') >= 0) {
          const elemDimension = axis === 'x' ? el.offsetWidth : el.offsetHeight;
          convertedOrigin.push((elemDimension * parseFloat(value)) / 100);
        } else {
          convertedOrigin.push(parseFloat(value));
        }
      }
    }

    return convertedOrigin;
  };

  // Handle positioning of tether component.
  useLayoutEffect(() => {
    if (!sourceEl.current || !shouldUpdatePosition) {
      return;
    }

    const fitsWithinViewport = (xMin, yMin, xMax, yMax) => {
      const result = { xMin: true, yMin: true, xMax: true, yMax: true };
      if (xMin < 0) {
        result.xMin = false;
      }
      if (xMax > document.documentElement.scrollWidth) {
        result.xMax = false;
      }
      if (yMin < 0) {
        result.yMin = false;
      }
      if (yMax > document.documentElement.scrollWidth) {
        result.yMax = false;
      }
      return result;
    };

    const getPosition = () => {
      let { top, left } = sourceEl.current.getBoundingClientRect();
      const topToSource = Math.floor(top);
      const leftToSource = Math.floor(left);

      const convertedSourceAnchor = convertElOriginToPixels(
        sourceAnchorCoord,
        sourceEl.current,
      );
      const convertedTetherAnchor = convertElOriginToPixels(
        tetherAnchorCoord,
        tetherEl.current,
      );

      let slaveLeft = leftToSource + convertedSourceAnchor[0];
      let slaveTop = topToSource + convertedSourceAnchor[1];

      slaveLeft -= convertedTetherAnchor[0];
      slaveTop -= convertedTetherAnchor[1];

      let hasFlippedX = false;
      let hasFlippedY = false;

      // TODO: Don't bother repositioning if we're just going to put it into another shitty position - stick with defaults.
      if (fitInViewport) {
        // Check tethered element won't partially render outside of the viewport.
        const { xMin, yMin, xMax, yMax } = fitsWithinViewport(
          slaveLeft,
          slaveTop,
          slaveLeft + tetherEl.current.offsetWidth,
          slaveTop + tetherEl.current.offsetHeight,
        );

        // TODO: This isn't perfect. Not always flipping to the right position. Check math.
        if (!xMin) {
          slaveLeft += convertedTetherAnchor[0] - convertedSourceAnchor[0];
          hasFlippedX = true;
        }
        if (!xMax) {
          slaveLeft -= tetherEl.current.offsetWidth + convertedSourceAnchor[0];
          hasFlippedX = true;
        }
        if (!yMin) {
          slaveTop += convertedTetherAnchor[1] - convertedSourceAnchor[1];
          hasFlippedY = true;
        }
        if (!yMax) {
          slaveTop -= tetherEl.current.offsetHeight + convertedSourceAnchor[1];
          hasFlippedY = true;
        }
      }

      setFlippedX(hasFlippedX);
      setFlippedY(hasFlippedY);

      // Adjust for scroll
      slaveLeft += window.pageXOffset;
      slaveTop += window.pageYOffset;

      // Apply position to element.
      tetherEl.current.style.top = `${slaveTop}px`;
      tetherEl.current.style.left = `${slaveLeft}px`;
    };

    // XXX Removed requestAnimationFrame as it was causing tooltip to position incorrectly for a
    // frame. Leaving comment incase it causes other issues.
    // window.requestAnimationFrame(() => {
    getPosition();
    // });
    documentWindowEl.addEventListener('resize', getPosition);
    documentWindowEl.addEventListener('scroll', getPosition);

    return () => {
      documentWindowEl.removeEventListener('resize', getPosition);
      documentWindowEl.removeEventListener('scroll', getPosition);
    };
  }, [
    documentWindowEl,
    fitInViewport,
    sourceAnchorCoord,
    tetherAnchorCoord,
    shouldUpdatePosition,
  ]);

  // If tetherComponent is function populate it with some helpful render props.
  const tetherComponentActual = React.isValidElement(tetherComponent)
    ? tetherComponent
    : tetherComponent({ flippedX: flippedX, flippedY: flippedY });

  return (
    <Fragment>
      <div {...props} ref={sourceEl} sx={{ display: 'inline-flex' }}>
        {children}
      </div>
      {createPortal(tetherComponentActual, tetherEl.current)}
    </Fragment>
  );
};

Tether.propTypes = {
  /** The source component. */
  children: PropTypes.node.isRequired,
  /** The component that should be getting tethered. Can either be a typical react component
   * or a render function. The render function has access to the flippedX and flippedY props
   * which state whether the tetherComponent was flipped on an axis in order to fit onto the screen.
   */
  tetherComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func])
    .isRequired,
  /** The position in the source component that the tethered component should
   attach to with it's anchor. Can accept numeric, pixel or percentage values.
   */
  sourceAnchorCoord: PropTypes.shape({
    x: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    y: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
  /** The position in the tether component that the source component should
   attach to with it's anchor. Can accept numeric, pixel or percentage values.
   */
  tetherAnchorCoord: PropTypes.shape({
    x: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    y: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
  /** Will attempt to reposition the tethered component to always sit within the viewport. */
  fitInViewport: PropTypes.bool,
  /** Controls whether the tethered component will update it's position when the window
   * is resized or scrolled. Is useful for performance gain by avoiding unecessary calculations.
   */
  shouldUpdatePosition: PropTypes.bool,
};

Tether.defaultProps = {
  fitInViewport: false,
  shouldUpdatePosition: true,
  sourceAnchorCoord: {
    x: 0,
    y: '100%',
  },
  tetherAnchorCoord: {
    x: 0,
    y: 0,
  },
};

export default Tether;
