/** @jsx jsx */
import { jsx } from 'theme-ui';

import Home from './Home';

export default {
  title: 'Pages/Home',
  component: Home,
  // argTypes: {
  //   backgroundColor: { control: 'color' },
  // },
};

const Template = (args) => <Home {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  primary: true,
};
