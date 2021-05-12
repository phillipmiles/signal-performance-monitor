/** @jsx jsx */
import PropTypes from 'prop-types';
import React, {
  Fragment,
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
} from 'react';
import { jsx } from 'theme-ui';

const ContentSlider = ({
  children,
  currentIndex,
  applyFadeEffect,
  animationResizeDuration,
  animationFadeDuration,
  animationSlideDuration,
  unmountWhenHidden,
  ...props
}) => {
  /* Height of the carosel track */
  const [height, setHeight] = useState('auto');
  /* Flag for if the the carosel is currently animating a transition */
  const [isAnimating, setIsAnimating] = useState(false);
  /* Reference to the previous index for transitioning away from */
  const [previousIndex, setPreviousIndex] = useState(currentIndex);
  /* Holds the timeout that runs the duraction of a transition animation */

  const [transitionToIndex, setTransitionToIndex] = useState(currentIndex);

  const animationEndTimeout = useRef();
  const trackRef = useRef();

  useLayoutEffect(() => {
    const endAnimation = () => {
      setPreviousIndex(currentIndex);
      setHeight('auto');
      setIsAnimating(false);
    };

    const updateCaroselHeight = () => {
      const currentCaroselItem =
        trackRef.current.children[currentIndex].children[0];
      const transitionedCaroselItem =
        trackRef.current.children[previousIndex].children[0];

      requestAnimationFrame(() => {
        // Set current height ready for animating from
        setHeight(`${transitionedCaroselItem.scrollHeight}px`);

        requestAnimationFrame(() => {
          // Set new height for animating to
          setHeight(`${currentCaroselItem.scrollHeight}px`);
          animationEndTimeout.current = setTimeout(
            endAnimation,
            animationResizeDuration,
          );
        });
      });
    };

    if (!isAnimating && previousIndex !== currentIndex) {
      clearTimeout(animationEndTimeout.current);
      setTransitionToIndex(currentIndex);
      setIsAnimating(true);
      updateCaroselHeight();
    }
  }, [
    isAnimating,
    currentIndex,
    height,
    previousIndex,
    animationResizeDuration,
    animationEndTimeout,
  ]);

  useEffect(() => {
    return () => {
      clearTimeout(animationEndTimeout.current);
    };
  }, []);

  // Checks if number (n) is between values (a) and (b).
  const isBetween = (n, a, b) => {
    return (n - a) * (n - b) <= 0;
  };

  const findItemPosition = (index) => {
    return `${(index - transitionToIndex) * 100}%`;
  };

  return (
    <div
      {...props}
      sx={{
        overflow: unmountWhenHidden && !isAnimating ? 'visible' : 'hidden',
        width: '100%',
        height,
        position: 'relative',
        transition: `height ${animationResizeDuration}ms`,
      }}
      ref={trackRef}
    >
      {React.Children.map(children, (item, index) => (
        <div
          sx={{
            position: 'relative',
            width: '100%',
            transition: `opacity ${animationFadeDuration}ms`,
            opacity: applyFadeEffect && transitionToIndex !== index ? 0 : 1,
          }}
        >
          <div
            sx={{
              // Used to stop collapsing margins on children content. It clashes overflow hidden on root div
              // already does this but unMountWhenHidden toggles it on an off so we need this hard kill
              // on the effect here.
              overflow: 'hidden',

              position:
                !isAnimating && transitionToIndex === index
                  ? 'static'
                  : 'absolute',
              width: '100%',
              transition: `transform ${animationSlideDuration}ms cubic-bezier(0.21, 0.61, 0.15, 1)`,
              transform:
                !isAnimating && transitionToIndex === index
                  ? 'translateX(0)'
                  : `translateX(${findItemPosition(index)})`,
            }}
            index={index}
          >
            {(!unmountWhenHidden ||
              (!applyFadeEffect &&
                isBetween(index, previousIndex, transitionToIndex)) ||
              (applyFadeEffect &&
                (index === previousIndex || index === transitionToIndex))) && (
              <Fragment>{item}</Fragment>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

ContentSlider.propTypes = {
  /** An array of carosel slides */
  children: PropTypes.arrayOf(PropTypes.node),

  /** Specifies which carosel item should be in view */
  currentIndex: PropTypes.number,

  /** Controls whether content should transition with a fade effect */
  applyFadeEffect: PropTypes.bool,

  /** Set the transiton slide animation duration in milliseconds */
  animationSlideDuration: PropTypes.number,

  /** Set the fade animation duration in milliseconds */
  animationFadeDuration: PropTypes.number,

  /** Set the resize animation duration in milliseconds */
  animationResizeDuration: PropTypes.number,

  /** Will cause hidden slides to unmount from the DOM. */
  unmountWhenHidden: PropTypes.bool,
};

ContentSlider.defaultProps = {
  children: null,
  currentIndex: 0,
  applyFadeEffect: true,
  animationSlideDuration: 500,
  animationFadeDuration: 400,
  animationResizeDuration: 400,
  unmountWhenHidden: true,
};

export default ContentSlider;
