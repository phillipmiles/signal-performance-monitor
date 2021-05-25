/** @jsx jsx */
import { jsx, Flex } from 'theme-ui';
import Heading from '../components/generic/Heading';
import MarketChart from '../components/MarketChart';
import ActivityIndicator from '../components/ActivityIndicator';
import ButtonIcon from '../components/generic/ButtonIcon';
import { faChartBar } from '@fortawesome/free-regular-svg-icons';
import { faCoins, faChartLine, faCog } from '@fortawesome/free-solid-svg-icons';
import MarketChartSidePanel from '../components/MarketChartSidePanel';
import Text from '../components/generic/Text';
import DisplayDataItem from '../components/DisplayDataItem';

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
  isInfoPanelVisible,
  isIndicatorsSettingsPanelVisible,
  toggleIndicatorsSettingsPanel,
  toggleInfoPanel,
  onHoverCandle,
  focusedDataItem,
  isBackTestPanelVisible,
  toggleBackTestPanel,
  backTestProfit,
  numBackTestEntries,
  numBackTestExits,
  backTestBiggestGain,
  backTestBiggestLoss,
}) => {
  return (
    <div
      sx={{
        height: '100vh',
        bg: '#161D25',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
        }}
      >
        <Flex
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 3,
            py: 2,
            bg: '#0E131A',
          }}
        >
          <Heading as="h1" variant="heading5" sx={{ color: 'white' }}>
            {marketId}
          </Heading>
          <div>
            <ButtonIcon
              icon={faCoins}
              onClick={toggleBackTestPanel}
              ariaLabel="Toggle back test panel"
              sx={{ ml: 2 }}
              selected={isBackTestPanelVisible}
            />
            <ButtonIcon
              icon={faChartLine}
              onClick={toggleInfoPanel}
              ariaLabel="Toggle analysis panel"
              sx={{ ml: 2 }}
              selected={isInfoPanelVisible}
            />
            <ButtonIcon
              icon={faCog}
              sx={{ ml: 2 }}
              onClick={toggleIndicatorsSettingsPanel}
              ariaLabel="Toggle indicators panel"
              selected={isIndicatorsSettingsPanelVisible}
            />
          </div>
        </Flex>
        {isLoadingData ? (
          <ActivityIndicator />
        ) : (
          <Flex
            sx={{
              flexGrow: 1,
              borderRadius: 8,
            }}
          >
            <div sx={{ flexGrow: 1 }}>
              <MarketChart
                marketData={marketData}
                emaShort={emaShort}
                emaLong={emaLong}
                emaDouble={emaDouble}
                trends={trends}
                momentumOffset={momentumOffset}
                rsiOptions={rsiOptions}
                rsiYAccessor={rsiYAccessor}
                onHoverCandle={onHoverCandle}
              />
            </div>

            {isInfoPanelVisible && (
              <MarketChartSidePanel>
                <Heading as="h2" variant="heading6" sx={{ mb: 3 }}>
                  Info
                </Heading>
                <DisplayDataItem
                  label="High"
                  value={`$${focusedDataItem.high}`}
                />
                <DisplayDataItem
                  label="Low"
                  value={`$${focusedDataItem.low}`}
                />
                <DisplayDataItem
                  label="Open"
                  value={`$${focusedDataItem.open}`}
                />
                <DisplayDataItem
                  label="Close"
                  value={`$${focusedDataItem.close}`}
                />
                <DisplayDataItem
                  label="Volume"
                  value={Math.floor(focusedDataItem.volume)}
                />
                <Heading as="h2" variant="heading6" sx={{ mt: 4, mb: 3 }}>
                  Indicators
                </Heading>
                <DisplayDataItem label="Candle type" value={`???`} />
                <Heading as="h2" variant="heading6" sx={{ mt: 4, mb: 3 }}>
                  Analysis
                </Heading>
                <DisplayDataItem label="Blah candle type" value="Bearish" />
                <DisplayDataItem
                  label="Approaching previous resistance"
                  value="Bearish"
                />
              </MarketChartSidePanel>
            )}
            {isIndicatorsSettingsPanelVisible && (
              <MarketChartSidePanel>
                <Heading as="h2" variant="heading6" sx={{ mb: 3 }}>
                  Indicators
                </Heading>
              </MarketChartSidePanel>
            )}
            {isBackTestPanelVisible && (
              <MarketChartSidePanel>
                <Heading as="h2" variant="heading6" sx={{ mb: 3 }}>
                  Back test
                </Heading>
                <DisplayDataItem
                  label="Profit"
                  value={`${Math.floor(backTestProfit * 100) / 100}%`}
                />
                <DisplayDataItem
                  label="Number of entries"
                  value={numBackTestEntries}
                />
                <DisplayDataItem
                  label="Number of exits"
                  value={numBackTestExits}
                />
                <DisplayDataItem
                  label="Biggest gain"
                  value={`${Math.floor(backTestBiggestGain * 100) / 100}%`}
                />
                <DisplayDataItem
                  label="Biggest loss"
                  value={`${Math.floor(backTestBiggestLoss * 100) / 100}%`}
                />
              </MarketChartSidePanel>
            )}
          </Flex>
        )}
      </div>
    </div>
  );
};

export default MarketView;
