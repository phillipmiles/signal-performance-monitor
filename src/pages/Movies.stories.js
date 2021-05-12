/** @jsx jsx */
import { jsx } from 'theme-ui';

import Movies from './Movies';

export default {
  title: 'Pages/Movies',
  component: Movies,
  // argTypes: {
  //   backgroundColor: { control: 'color' },
  // },
};

const Template = (args) => <Movies {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  primary: true,
};
