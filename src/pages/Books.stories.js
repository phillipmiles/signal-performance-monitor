/** @jsx jsx */
import { jsx } from 'theme-ui';

import Books from './Books';

export default {
  title: 'Pages/Books',
  component: Books,
  // argTypes: {
  //   backgroundColor: { control: 'color' },
  // },
};

const Template = (args) => <Books {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  primary: true,
};
