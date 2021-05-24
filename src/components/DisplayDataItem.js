/** @jsx jsx */
import { jsx } from 'theme-ui';
import Text from './generic/Text';

const DisplayDataItem = ({ label, value, ...props }) => (
  <Text
    sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 0 }}
    {...props}
  >
    <Text sx={{ fontSize: 'inherit', color: 'neutral.7' }}>{label}</Text>
    <Text sx={{ fontSize: 'inherit' }}>{value}</Text>
  </Text>
);

export default DisplayDataItem;
