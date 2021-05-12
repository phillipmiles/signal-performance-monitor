/** @jsx jsx */
import { jsx } from 'theme-ui';

import Login from './Login';

export default {
  title: 'Pages/Login',
  component: Login,
  // argTypes: {
  //   backgroundColor: { control: 'color' },
  // },
};

const Template = (args) => <Login {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  primary: true,
};
