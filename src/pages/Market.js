/** @jsx jsx */
import { jsx } from 'theme-ui';
import PropTypes from 'prop-types';
import {
  Chart,
  ChartCanvas,
  CandlestickSeries,
  YAxis,
  XAxis,
  discontinuousTimeScaleProviderBuilder,
  withDeviceRatio,
  withSize,
  LineSeries,
  ema,
  MovingAverageTooltip,
  TrendLine,
} from 'react-financial-charts';
import { useCallback, useState } from 'react';

const MarketView = ({
  marketId,
  isLoadingBooks,
  marketData: initialMarketData,
  error,
  ratio,
  width,
  height,
}) => {
  const [trends, setTrends] = useState([
    {
      type: 'LINE',
      selected: false,
      start: [110, 41329.107142857145],
      end: [158, 48078.66071428571],
      appearance: {
        edgeFill: '#FFFFFF',
        edgeStroke: '#000000',
        edgeStrokeWidth: 1,
        r: 6,
        strokeDasharray: 'Solid',
        strokeStyle: '#000000',
        strokeWidth: 1,
      },
    },
    {
      type: 'LINE',
      selected: false,
      // Size of x axies is from 0 to number of data points.
      start: [0, 41329.107142857145],
      end: [168, 48078.66071428571],
      appearance: {
        edgeFill: '#FFFFFF',
        edgeStroke: '#000000',
        edgeStrokeWidth: 1,
        r: 6,
        strokeDasharray: 'Solid',
        strokeStyle: '#000000',
        strokeWidth: 1,
      },
    },
  ]);

  const onDrawTrendComplete = useCallback((event, trends) => {
    console.log('HEEERERE');
    console.log(trends);
    setTrends(trends);
  }, []);

  const xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
    (d) => new Date(d.time),
  );

  const emaShort = ema()
    .id('short')
    .options({ windowSize: 10 })
    .merge((d, c) => {
      d.emaShort = c;
    })
    .accessor((d) => d.emaShort);
  const emaLong = ema()
    .id('long')
    .options({ windowSize: 21 })
    .merge((d, c) => {
      d.emaLong = c;
    })
    .accessor((d) => d.emaLong);

  const calculatedData = emaLong(emaShort(initialMarketData));
  console.log('WTF 2', emaShort);

  const yExtents = (data) => {
    return [data.high, data.low];
  };

  console.log(initialMarketData);
  const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(
    calculatedData,
  );

  const max = xAccessor(data[data.length - 1]);
  const min = xAccessor(data[Math.max(0, data.length - 100)]);
  const xExtents = [min, max];
  console.log('max', min, max);
  return (
    <div>
      <h1>{marketId}</h1>
      {/* {isLoadingBooks && <p>Loading</p>} */}
      {error && <p>{error} </p>}
      <div>
        {initialMarketData.length > 0 && (
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
          >
            <Chart id={1} yExtents={yExtents}>
              <CandlestickSeries />
              <LineSeries
                yAccessor={emaShort.accessor()}
                strokeStyle={emaShort.stroke()}
              />
              <LineSeries
                yAccessor={emaLong.accessor()}
                strokeStyle={emaLong.stroke()}
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
              <XAxis
              // ticks={6}
              />
              <YAxis
              //  ticks={5}
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
          </ChartCanvas>
        )}
      </div>
      {/* {books.map((book) => (
        <p key={book.id}>{book.title}</p>
      ))} */}
    </div>
  );
};

MarketView.propTypes = {
  books: PropTypes.array,
  isLoadingBooks: PropTypes.bool,
  loadingBooksError: PropTypes.string,
};

MarketView.defaultProps = {
  books: [],
  isLoadingBooks: false,
  loadingBooksError: '',
};

export default withSize({ style: { minHeight: 600 } })(
  withDeviceRatio()(MarketView),
);
