/** @jsx jsx */
import { jsx } from 'theme-ui';
import Icon from './Icon';
import { faChartBar } from '@fortawesome/free-regular-svg-icons';

export default {
  title: 'Components/Icon',
  component: Icon,
};

const Template = (args) => <Icon {...args} />;

export const Normal = Template.bind({});

Normal.args = {
  icon: faChartBar,
};
