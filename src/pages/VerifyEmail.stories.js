/** @jsx jsx */
import { jsx } from 'theme-ui';

import VerifyEmail from './VerifyEmail';

export default {
  title: 'Pages/VerifyEmail',
  component: VerifyEmail,
  // argTypes: {
  //   backgroundColor: { control: 'color' },
  // },
};

const Template = (args) => <VerifyEmail {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  primary: true,
};
