/** @jsx jsx */
import { jsx, useThemeUI } from 'theme-ui';
import PropTypes from 'prop-types';
import { format } from 'd3-format';
import {
  Annotate,
  MouseCoordinateY,
  SvgPathAnnotation,
  LabelAnnotation,
  discontinuousTimeScaleProviderBuilder,
  withDeviceRatio,
  withSize,
  ChartCanvas,
  Chart,
  CandlestickSeries,
  YAxis,
  XAxis,
  LineSeries,
  MovingAverageTooltip,
  TrendLine,
  CrossHairCursor,
  RSISeries,
  RSITooltip,
  BarSeries,
} from 'react-financial-charts';
import { useCallback, useEffect, useState, useMemo } from 'react';

const margin = { left: 0, right: 108, top: 0, bottom: 48 };
const rsiYExtents = [0, 100];
const rsiTickValues = [30, 50, 70];
const rsiToolTipOrigin = [8, 16];

const MarketChart = ({
  marketId,
  marketData,
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
  onHoverCandle,
}) => {
  const { theme } = useThemeUI();

  const styleAxisColor = theme.colors.neutral[6];
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

  const annotationWhen = (d) => {
    if (d.indicators !== undefined) {
      const emaCrossIndicator = d.indicators.find(
        (indicator) => indicator.id === 'ema-cross',
      );
      if (emaCrossIndicator) {
        return true;
      }
    }
    return false;
  };

  const backtestEntryAnnotationWhen = (d) => {
    if (d.backtestEvents !== undefined) {
      const entryEvents = d.backtestEvents.filter(
        (event) => event.type === 'entry',
      );
      if (entryEvents.length > 0) {
        return true;
      }
    }
    return false;
  };

  const backtestExitAnnotationWhen = (d) => {
    if (d.backtestEvents !== undefined) {
      const exitEvents = d.backtestEvents.filter(
        (event) => event.type === 'exit',
      );
      if (exitEvents.length > 0) {
        return true;
      }
    }
    return false;
  };

  const annotation = {
    fill: '#2196f3',
    path: () =>
      'M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z',
    pathWidth: 12,
    pathHeight: 22,
    tooltip: 'Go short',
    y: ({ yScale, datum }) => yScale(datum.emaShort),
  };

  const backTestEntryAnnotation = {
    fill: '#00DD00',
    path: () =>
      'M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z',
    pathWidth: 12,
    pathHeight: 22,
    y: ({ yScale, datum }) => yScale(datum.close),
  };

  const backTestExitAnnotation = {
    fill: '#DD0000',
    path: () =>
      'M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z',
    pathWidth: 12,
    pathHeight: 22,
    y: ({ yScale, datum }) => yScale(datum.close + datum.close * 0.01),
  };

  const pricesDisplayFormat = format('.2f');

  const customSnapX = (props, moreProps) => {
    const { xScale, xAccessor, currentItem, mouseXY } = moreProps;
    const { snapX } = props;
    const x = snapX ? Math.round(xScale(xAccessor(currentItem))) : mouseXY[0];
    onHoverCandle(currentItem);
    return x;
  };
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
        getCanvasContexts={() => console.log('wtf')}
        onClick={(e) => console.log('fucking', e)}
        getMutableState={() => console.log('blehg')}
        onMouseMove={() => console.log('erm')}
      >
        <Chart id={'chartId'} yExtents={yExtents} height={candleChartHeight}>
          <CandlestickSeries />
          <CrossHairCursor
            strokeStyle={theme.colors.neutral[7]}
            customX={customSnapX}
          />
          <MouseCoordinateY
            arrowWidth={10}
            displayFormat={pricesDisplayFormat}
          />
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
          {/* <Annotate
            with={SvgPathAnnotation}
            usingProps={annotation}
            when={annotationWhen}
          /> */}
          <Annotate
            with={SvgPathAnnotation}
            usingProps={backTestEntryAnnotation}
            when={backtestEntryAnnotationWhen}
          />
          <Annotate
            with={SvgPathAnnotation}
            usingProps={backTestExitAnnotation}
            when={backtestExitAnnotationWhen}
          />
          <XAxis
            ticks={0}
            strokeStyle={styleAxisColor}
            tickStrokeStyle={styleAxisColor}
            tickLabelFill={styleAxisColor}
          />
          <YAxis
            strokeStyle={styleAxisColor}
            tickStrokeStyle={styleAxisColor}
            tickLabelFill={styleAxisColor}
          />
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
        </Chart>

        <Chart
          id={'rsi'}
          yExtents={rsiYExtents}
          height={rsiChartHeight}
          origin={rsiChartOrigin}
        >
          <XAxis
            ticks={0}
            strokeStyle={styleAxisColor}
            tickStrokeStyle={styleAxisColor}
            tickLabelFill={styleAxisColor}
          />
          <YAxis
            tickValues={rsiTickValues}
            strokeStyle={styleAxisColor}
            tickStrokeStyle={styleAxisColor}
            tickLabelFill={styleAxisColor}
          />
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
          <YAxis
            strokeStyle={styleAxisColor}
            tickStrokeStyle={styleAxisColor}
            tickLabelFill={styleAxisColor}
          />
          <XAxis
            strokeStyle={styleAxisColor}
            tickStrokeStyle={styleAxisColor}
            tickLabelFill={styleAxisColor}
            ticks={20}
          />
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

export default withSize({
  style: {
    // minHeight: 660,
  },
})(withDeviceRatio()(MarketChart));
