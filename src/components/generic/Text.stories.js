import React from 'react';

import Text from './Text';

export default {
  title: 'Typography/Text',
  component: Text,
};

const Template = (args) => <Text {...args}>Lorem ipsum dolor sit amet.</Text>;

export const Body = Template.bind({});

export const Callout = Template.bind({});
Callout.args = {
  variant: 'callout',
};

export const Detail = Template.bind({});
Detail.args = {
  variant: 'detail',
};
