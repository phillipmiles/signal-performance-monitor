/** @jsx jsx */
import { jsx } from 'theme-ui';

import Register from './Register';

export default {
  title: 'Pages/Register',
  component: Register,
  // argTypes: {
  //   backgroundColor: { control: 'color' },
  // },
};

const Template = (args) => <Register {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  primary: true,
};
