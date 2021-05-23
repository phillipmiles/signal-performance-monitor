/** @jsx jsx */
import { jsx } from 'theme-ui';
import PropTypes from 'prop-types';
import {
  discontinuousTimeScaleProviderBuilder,
  withDeviceRatio,
  withSize,
  ChartCanvas,
  Chart,
  CandlestickSeries,
  YAxis,
  XAxis,
  LineSeries,
  ema,
  MovingAverageTooltip,
  TrendLine,
  CrossHairCursor,
  RSISeries,
  RSITooltip,
  BarSeries,
} from 'react-financial-charts';
import { useCallback, useEffect, useState, useMemo } from 'react';
import Heading from '../components/generic/Heading';

const margin = { left: 0, right: 64, top: 0, bottom: 24 };
const rsiYExtents = [0, 100];
const rsiTickValues = [30, 50, 70];
const rsiToolTipOrigin = [8, 16];

const MarketChart = ({
  marketId,
  isLoadingBooks,
  marketData,
  error,
  emaShort,
  emaLong,
  emaDouble,
  trends,
  momentumOffset,
  rsiOptions,
  rsiYAccessor,
  ratio,
  width,
  height,
}) => {
  const xScaleProvider = useMemo(
    () =>
      discontinuousTimeScaleProviderBuilder().inputDateAccessor(
        (d) => new Date(d.time),
      ),
    [],
  );

  const { data, xScale, xAccessor, displayXAccessor } = useMemo(
    () => xScaleProvider(marketData),
    [marketData, xScaleProvider],
  );

  const max = useMemo(() => xAccessor(data[data.length - 1]), [
    xAccessor,
    data,
  ]);
  const min = useMemo(() => xAccessor(data[Math.max(0, data.length - 100)]), [
    xAccessor,
    data,
  ]);

  const xExtents = useMemo(() => [min, max], [min, max]);

  const yExtents = (data) => {
    return [data.high, data.low];
  };
  const onDrawTrendComplete = useCallback((event, trends) => {
    // setTrends(trends);
  }, []);

  const barChartHeight = 100;
  const barChartOrigin = (_, h) => [0, h - barChartHeight];
  const barChartExtents = (data) => {
    return data.volume;
  };

  const rsiChartHeight = 100;
  const rsiChartOrigin = (_, h) => [0, h - rsiChartHeight - barChartHeight];

  const volumeSeries = (data) => {
    return data.volume;
  };

  const candleChartHeight =
    height - margin.top - margin.bottom - rsiChartHeight - barChartHeight;
  if (marketData.length > 0) {
    return (
      <ChartCanvas
        data={data}
        seriesName="Data"
        xScale={xScale}
        displayXAccessor={displayXAccessor}
        xAccessor={xAccessor}
        ratio={ratio}
        width={width}
        height={height}
        xExtents={xExtents}
        margin={margin}
      >
        <Chart id={'chartId'} yExtents={yExtents} height={candleChartHeight}>
          <CandlestickSeries />
          <LineSeries
            yAccessor={emaShort.accessor()}
            strokeStyle={emaShort.stroke()}
          />
          <LineSeries
            yAccessor={emaLong.accessor()}
            strokeStyle={emaLong.stroke()}
          />
          <LineSeries
            yAccessor={emaDouble.accessor()}
            strokeStyle={emaDouble.stroke()}
          />

          <LineSeries
            yAccessor={(d) => d.smooth}
            strokeStyle="#00FF11"
            strokeWidth={2}
          />
          <LineSeries
            yAccessor={(d) => d.smoothAvgPriceRange}
            strokeStyle="#0011FF"
            strokeWidth={2}
          />
          <LineSeries
            yAccessor={(d) => d.momentum1 + momentumOffset}
            strokeStyle="#FF0011"
            strokeWidth={1}
          />
          <LineSeries
            yAccessor={(d) => d.momentum2 + momentumOffset}
            strokeStyle="#000000"
            strokeWidth={1}
          />
          <TrendLine
            type="LINE"
            snap={false}
            enabled={false}
            snapTo={(d) => [d.high, d.low]}
            onStart={() => console.log('START')}
            onSelect={() => console.log('SELECT')}
            onDrag={() => console.log('DO NOTHING ON DRAG')}
            onDragComplete={() => console.log('DO NOTHING ON DRAG')}
            onComplete={onDrawTrendComplete}
            trends={trends}
          />
          <XAxis ticks={0} />
          <YAxis />
          <MovingAverageTooltip
            origin={[8, 0]}
            options={[
              {
                stroke: emaShort.stroke(),
                type: 'EMA',
                windowSize: emaShort.options().windowSize,
                yAccessor: emaShort.accessor(),
              },
              {
                stroke: emaLong.stroke(),
                type: 'EMA',
                windowSize: emaLong.options().windowSize,
                yAccessor: emaLong.accessor(),
              },
            ]}
          />
          <CrossHairCursor />
        </Chart>

        <Chart
          id={'rsi'}
          yExtents={rsiYExtents}
          height={rsiChartHeight}
          origin={rsiChartOrigin}
        >
          <XAxis ticks={0} />
          <YAxis tickValues={rsiTickValues} />
          <RSISeries yAccessor={rsiYAccessor} />
          <RSITooltip
            origin={rsiToolTipOrigin}
            yAccessor={rsiYAccessor}
            options={rsiOptions}
          />
        </Chart>
        <Chart
          id={'volume'}
          height={barChartHeight}
          origin={barChartOrigin}
          yExtents={barChartExtents}
        >
          <YAxis />
          <XAxis />
          <BarSeries yAccessor={volumeSeries} />
        </Chart>
      </ChartCanvas>
    );
  } else {
    return null;
  }
};

MarketChart.propTypes = {
  books: PropTypes.array,
  isLoadingBooks: PropTypes.bool,
  loadingBooksError: PropTypes.string,
};

MarketChart.defaultProps = {
  books: [],
  isLoadingBooks: false,
  loadingBooksError: '',
};

export default withSize({ style: { minHeight: 740 } })(
  withDeviceRatio()(MarketChart),
);
