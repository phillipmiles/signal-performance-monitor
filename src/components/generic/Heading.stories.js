/** @jsx jsx */
import { jsx } from 'theme-ui';
import Heading from './Heading';

export default {
  title: 'Typography/Heading',
  component: Heading,
};

const Template = (args) => <Heading {...args}>Lorem ipsum</Heading>;


export const heading1 = Template.bind({});
export const heading2 = Template.bind({});
export const heading3 = Template.bind({});
export const heading4 = Template.bind({});
export const heading5 = Template.bind({});
export const heading6 = Template.bind({});
export const overflowEllipsis = Template.bind({});

heading1.args = { as: 'h1' };
heading2.args = { as: 'h2' };
heading3.args = { as: 'h3' };
heading4.args = { as: 'h4' };
heading5.args = { as: 'h5' };
heading6.args = { as: 'h6' };
overflowEllipsis.args = { as: 'h6', overflow: "ellipsis", sx: { width: '96px' } };

// export const h1 = () => <Heading as="h1">Lorem ipsum</Heading>;
// export const h2 = () => <Heading as="h2">Heading 2</Heading>;
// export const h3 = () => <Heading as="h3">Heading 3</Heading>;
// export const h4 = () => <Heading as="h4">Heading 4</Heading>;
// export const h5 = () => <Heading as="h5">Heading 5</Heading>;
// export const h6 = () => <Heading as="h6">Heading 6</Heading>;
// export const overflowEllipsis = () => (
//   <Heading as="h6" overflow="ellipsis" sx={{ width: '128px' }}>
//     Overflow ellipsis example
//   </Heading>
// );


