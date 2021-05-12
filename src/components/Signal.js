/** @jsx jsx */
import { jsx, Flex } from 'theme-ui';
import { useRecoilValue } from 'recoil';
import { signalsState, marketHistoricalPricesState } from '../state/signals';
import ActivityIndicator from '../components/ActivityIndicator';
import Paragraph from './generic/Paragraph';
import Text from './generic/Text';
import Heading from './generic/Heading';
import { Suspense } from 'react';
import SignalPerformance from './SignalPerformance';

const Signal = ({
  id,
  coin,
  author,
  side,
  entryPrice,
  timestamp,
  stopLossPrice,
  targets,
}) => {
  return (
    <Flex sx={{ justifyContent: 'space-between' }}>
      <div>
        <Heading as="h2" variant="heading4">
          {coin}
        </Heading>
        <Paragraph variant="detail">{id}</Paragraph>
        <Paragraph>{new Date(timestamp).toLocaleString()}</Paragraph>
        <Paragraph>{author}</Paragraph>
        <Paragraph>{side}</Paragraph>
      </div>
      <div>
        <Paragraph sx={{ mb: 0 }}>
          <strong>Entry zone</strong>
        </Paragraph>
        <Paragraph>
          ${entryPrice.low} - ${entryPrice.high}
        </Paragraph>
        <Paragraph sx={{ mb: 0 }}>
          <strong>Stop loss</strong>
        </Paragraph>
        <Paragraph>${stopLossPrice}</Paragraph>
        <Paragraph sx={{ mb: 0 }}>
          <strong>Targets</strong>
        </Paragraph>
        <Paragraph>
          {targets.map((target, index) => (
            <Text key={target} sx={{ mb: 2, mr: 3 }}>
              ${target}
            </Text>
          ))}
        </Paragraph>
      </div>
      <Suspense fallback={<ActivityIndicator />}>
        <SignalPerformance
          id={`${coin}-PERP`}
          startTime={timestamp}
          // entryPrice={(entryPrice.low + entryPrice.high) / 2}
          targets={targets}
          targetEntryPrice={entryPrice.high}
          stopLossPrice={stopLossPrice}
          side={side}
        />
      </Suspense>
    </Flex>
  );
};

export default Signal;
