/** @jsx jsx */
import { jsx } from 'theme-ui';

import Market from './Market';

export default {
  title: 'Pages/Market',
  component: Market,
  // argTypes: {
  //   backgroundColor: { control: 'color' },
  // },
};

const Template = (args) => <Market {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  primary: true,
};
