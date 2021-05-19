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
} from 'react-financial-charts';

const MarketView = ({
  marketId,
  isLoadingBooks,
  marketData: initialMarketData,
  error,
  ratio,
  width,
  height,
}) => {
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
