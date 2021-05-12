import React from 'react';

import Paragraph from './Paragraph';

export default {
  title: 'Typography/Paragraph',
  component: Paragraph,
  // argTypes: {
  //   backgroundColor: { control: 'color' },
  // },
};

const Template = (args) => (
  <Paragraph {...args}>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer consequat,
    justo vel rutrum consequat, mi ex aliquet sapien, nec tincidunt nisl lorem
    et est. Maecenas et varius felis, sit amet bibendum nisl. Pellentesque augue
    enim, mollis ac ante ut, ultricies congue quam. Quisque venenatis libero
    quis turpis dapibus, sed maximus turpis aliquam. Nam lorem ex, rutrum a
    tincidunt non, iaculis quis risus. Curabitur convallis metus ut mi
    consectetur, a sagittis purus pulvinar. Sed nunc lorem, lacinia a ligula eu,
    feugiat volutpat erat. Cras quis placerat dui, sit amet interdum lacus.
    Mauris ornare felis eget est malesuada, at tristique urna lacinia. Curabitur
    lobortis nunc in viverra porttitor. Fusce feugiat eget nibh ac iaculis.
    Integer lacinia elementum eros. Nam et dapibus sapien, sit amet convallis
    nulla. Curabitur mi erat, euismod sit amet orci eget, ullamcorper molestie
    tellus.
  </Paragraph>
);

export const Body = Template.bind({});

export const Callout = Template.bind({});
Callout.args = {
  variant: 'callout',
};

export const Detail = Template.bind({});
Detail.args = {
  variant: 'detail',
};
