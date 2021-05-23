/** @jsx jsx */
import { jsx } from 'theme-ui';
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
    <div>
      <Heading as="h1">{marketId}</Heading>
      {isLoadingData ? (
        <ActivityIndicator />
      ) : (
        <MarketChart
          marketData={marketData}
          emaShort={emaShort}
          emaLong={emaLong}
          emaDouble={emaDouble}
          trends={trends}
          momentumOffset={momentumOffset}
          rsiOptions={rsiOptions}
          rsiYAccessor={rsiYAccessor}
        />
      )}
    </div>
  );
};

export default MarketView;
