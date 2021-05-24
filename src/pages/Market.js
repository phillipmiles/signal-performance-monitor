/** @jsx jsx */
import { jsx, Flex } from 'theme-ui';
import Heading from '../components/generic/Heading';
import MarketChart from '../components/MarketChart';
import ActivityIndicator from '../components/ActivityIndicator';

const MarketView = ({
  marketId,
  isLoadingData,
  marketData,
  error,
  emaShort,
  emaLong,
  emaDouble,
  trends,
  momentumOffset,
  rsiOptions,
  rsiYAccessor,
}) => {
  return (
    <div
      sx={{
        height: '100vh',
        bg: '#1D222B',
        px: 3,
        py: 3,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          // bg: 'black',
        }}
      >
        <Flex
          sx={{
            justifyContent: 'space-between',
            // borderBottomColor: 'neutral.6',
            // borderBottomWidth: 1,
            // borderBottomStyle: 'solid',
          }}
        >
          <Heading as="h1" variant="heading4" sx={{ mb: 4, color: 'white' }}>
            {marketId}
          </Heading>
          <div>
            <input type="checkbox" />
            Toggle rsi
          </div>
        </Flex>
        {isLoadingData ? (
          <ActivityIndicator />
        ) : (
          <div
            sx={{
              flexGrow: 1,
              // mx: 4,

              // p: 4,

              borderRadius: 8,
            }}
          >
            <MarketChart
              height={300}
              marketData={marketData}
              emaShort={emaShort}
              emaLong={emaLong}
              emaDouble={emaDouble}
              trends={trends}
              momentumOffset={momentumOffset}
              rsiOptions={rsiOptions}
              rsiYAccessor={rsiYAccessor}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketView;
