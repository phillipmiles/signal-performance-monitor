/** @jsx jsx */
import PropTypes from 'prop-types';
import { Flex, jsx } from 'theme-ui';

const Candle = ({ high, low, open, close, ...props }) => {
  const candleRange = high - low;
  const bodyTop = open > close ? open : close;
  const bodyBottom = open > close ? close : open;
  const topWickHeight = ((high - bodyTop) / candleRange) * 100;
  const bottomWickHeight = ((bodyBottom - low) / candleRange) * 100;
  const bodyHeight = ((bodyTop - bodyBottom) / candleRange) * 100;

  const color = open > close ? 'red' : 'green';
  return (
    <Flex
      sx={{
        width: '20px',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      {...props}
    >
      <div sx={{ width: '2px', bg: color, height: `${topWickHeight}}%` }}></div>
      <div sx={{ width: '20px', bg: color, height: `${bodyHeight}}%` }}></div>
      <div
        sx={{ width: '2px', bg: color, height: `${bottomWickHeight}}%` }}
      ></div>
    </Flex>
  );
};

export default Candle;
