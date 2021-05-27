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
import { Fragment } from 'react';
import Candle from '../components/Candle';
import TetherExpander from '../components/generic/TetherExpander';

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
  numBackTestEntries,
  numBackTestExits,
  backTestBiggestGain,
  backTestBiggestLoss,
  backTestNumberProfitTrades,
  backTestNumberLossTrades,
  backTestResult,
  onRunBackTest,
  onOpenMarketsMenu,
  isMarketsMenuOpen,
  onChangeTimeFrame,
  timeFrame,
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
            py: 2,
            bg: '#0E131A',
          }}
        >
          <Flex>
            <Heading as="h1" variant="heading5" sx={{ color: 'white', px: 3 }}>
              {marketId}
            </Heading>
            <select value={timeFrame} onChange={onChangeTimeFrame}>
              {/* <option value="1w">1 week</option> */}
              <option value="1d">1 day</option>
              <option value="4h">4 hours</option>
              <option value="1h">1 hours</option>
              <option value="15m">15 minutes</option>
              <option value="5m">5 minutes</option>
            </select>
          </Flex>
          <div sx={{ px: 3 }}>
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
                <Flex>
                  <Flex
                    sx={{
                      flexGrow: 1,
                      maxWidth: '50%',
                      bg: '#161D25',
                      mr: 2,
                      py: 2,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Candle
                      high={focusedDataItem.high}
                      low={focusedDataItem.low}
                      open={focusedDataItem.open}
                      close={focusedDataItem.close}
                    />
                  </Flex>
                  <div sx={{ flexGrow: 1, maxWidth: '50%', ml: 2 }}>
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
                    <DisplayDataItem label="Candle type" value={`???`} />
                  </div>
                </Flex>

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
                <button onClick={onRunBackTest}>Run back test</button>
                {backTestResult && (
                  <Fragment>
                    <DisplayDataItem
                      label="Profit"
                      value={`${
                        Math.floor(backTestResult.profit * 100) / 100
                      }%`}
                    />
                    <DisplayDataItem
                      label="Compound profit"
                      value={`${
                        Math.floor(backTestResult.compoundProfit * 100) / 100
                      }%`}
                    />
                    <DisplayDataItem
                      label="Total gained"
                      value={`${
                        Math.floor(backTestResult.totalPercentageGained * 100) /
                        100
                      }%`}
                    />
                    <DisplayDataItem
                      label="Total lossed"
                      value={`${
                        Math.floor(backTestResult.totalPercentageLossed * 100) /
                        100
                      }%`}
                    />
                    <DisplayDataItem
                      label="Biggest gain"
                      value={`${Math.floor(backTestBiggestGain * 100) / 100}%`}
                    />
                    <DisplayDataItem
                      label="Biggest loss"
                      value={`${Math.floor(backTestBiggestLoss * 100) / 100}%`}
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
                      label="Number of profit trades"
                      value={backTestNumberProfitTrades}
                    />
                    <DisplayDataItem
                      label="Number of loss trades"
                      value={backTestNumberLossTrades}
                    />
                  </Fragment>
                )}
              </MarketChartSidePanel>
            )}
          </Flex>
        )}
      </div>
    </div>
  );
};

export default MarketView;
