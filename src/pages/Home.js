/** @jsx jsx */
import { jsx } from 'theme-ui';
import PropTypes from 'prop-types';
import Paragraph from '../components/Paragraph';
import ContentWrap from '../components/generic/ContentWrap';
import Signal from '../components/Signal';
import Heading from '../components/generic/Heading';

const Home = ({ signals }) => {
  return (
    <ContentWrap>
      <Heading as="h1" sx={{ mb: 6, mt: 4 }}>
        Signals Performance Monitor
      </Heading>

      {signals.map((signal) => (
        <Signal key={signal.id} {...signal} />
      ))}
    </ContentWrap>
  );
};

Home.propTypes = {
  counterValue: PropTypes.number,
  onClickIncrementCounter: PropTypes.func,
};

export default Home;
