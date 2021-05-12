import React from 'react';

import Paragraph from './Paragraph';

export default {
  title: 'Components/Paragraph',
  component: Paragraph,
  // argTypes: {
  //   backgroundColor: { control: 'color' },
  // },
};

const Template = (args) => <Paragraph {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  primary: true,
};
