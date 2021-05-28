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
    // fill: '#00DD00',
    fill: (data) => {
      const entryEvent = data.backtestEvents.find(
        (event) => event.type === 'entry',
      );
      if (entryEvent.profit < 0) {
        return '#DD0000';
      } else {
        return '#00DD00';
      }
    },
    path: (data) => {
      const entryEvent = data.backtestEvents.find(
        (event) => event.type === 'entry',
      );
      if (entryEvent.position === 'long') {
        return 'M0.3125 10.5C0.3125 15.8516 4.64844 20.1875 10 20.1875C15.3516 20.1875 19.6875 15.8516 19.6875 10.5C19.6875 5.14844 15.3516 0.8125 10 0.8125C4.64844 0.8125 0.3125 5.14844 0.3125 10.5ZM5.89844 11.6328C5.54688 12.0234 4.92188 12.0234 4.57031 11.6719L4.14062 11.2422C3.75 10.8516 3.75 10.2656 4.14062 9.91406L9.33594 4.71875C9.6875 4.36719 10.2734 4.36719 10.6641 4.71875L15.8203 9.91406C16.2109 10.2656 16.2109 10.8516 15.8203 11.2422L15.3906 11.6719C15.0391 12.0234 14.4141 12.0234 14.0625 11.6328L11.25 8.70312V15.8125C11.25 16.3594 10.8203 16.75 10.3125 16.75H9.6875C9.14062 16.75 8.75 16.3594 8.75 15.8125V8.70312L5.89844 11.6328Z';
      } else {
        return 'M19.6875 10.5C19.6875 5.14844 15.3516 0.8125 10 0.8125C4.64844 0.8125 0.3125 5.14844 0.3125 10.5C0.3125 15.8516 4.64844 20.1875 10 20.1875C15.3516 20.1875 19.6875 15.8516 19.6875 10.5ZM14.0625 9.40625C14.4141 9.01562 15.0391 9.01562 15.3906 9.36719L15.8203 9.79688C16.2109 10.1484 16.2109 10.7734 15.8203 11.125L10.625 16.3203C10.2734 16.6719 9.6875 16.6719 9.33594 16.3203L4.14062 11.125C3.78906 10.7734 3.78906 10.1875 4.14062 9.79688L4.57031 9.36719C4.92188 9.01562 5.54688 9.01562 5.89844 9.40625L8.75 12.3359V5.1875C8.75 4.67969 9.14062 4.25 9.6875 4.25H10.3125C10.8203 4.25 11.25 4.67969 11.25 5.1875V12.3359L14.0625 9.40625Z';
      }
    },
    pathWidth: 10,
    pathHeight: 24,
    y: ({ yScale, datum }) => yScale(datum.close),
  };

  const backTestExitAnnotation = {
    fill: (data) => {
      const exitEvent = data.backtestEvents.find(
        (event) => event.type === 'exit',
      );

      if (exitEvent.profit < 0) {
        return '#DD0000';
      } else {
        return '#00DD00';
      }
    },

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
        // getCanvasContexts={() => console.log('wtf')}
        // onClick={(e) => console.log('fucking', e)}
        // getMutableState={() => console.log('blehg')}
        // onMouseMove={() => console.log('erm')}
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
          {/* <LineSeries
            yAccessor={emaShort.accessor()}
            strokeStyle={emaShort.stroke()}
          /> */}
          {/*}
          <LineSeries
            yAccessor={emaLong.accessor()}
            strokeStyle={emaLong.stroke()}
          /> */}
          {/* <LineSeries
            yAccessor={emaDouble.accessor()}
            strokeStyle={emaDouble.stroke()}
          /> */}

          <LineSeries
            yAccessor={(d) => d.smooth}
            strokeStyle="#00FF11"
            strokeWidth={2}
          />
          {/* <LineSeries
            yAccessor={(d) => d.smoothAvg}
            strokeStyle="#0011FF"
            strokeWidth={2}
          /> */}
          {/* <LineSeries
            yAccessor={(d) => d.smoothDirectionExtremes}
            strokeStyle="#0011FF"
            strokeWidth={2}
          /> */}

          {/* <LineSeries
            yAccessor={(d) => d.momentum1 + momentumOffset}
            strokeStyle="#FF0011"
            strokeWidth={1}
          />
          <LineSeries
            yAccessor={(d) => d.momentum2 + momentumOffset}
            strokeStyle="#000000"
            strokeWidth={1}
          /> */}
          {/* <LineSeries
            yAccessor={(d) => d.ma100}
            strokeStyle="#FF4477"
            strokeWidth={1}
          /> */}
          {/* <LineSeries
            yAccessor={(d) => d.ma200}
            strokeStyle="white"
            strokeWidth={1}
          /> */}
          <TrendLine
            // type="XLINE"
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
          <Annotate
            with={SvgPathAnnotation}
            usingProps={annotation}
            when={annotationWhen}
          />
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
