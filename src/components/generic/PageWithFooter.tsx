/** @jsx jsx */
import { jsx, Flex } from 'theme-ui';

interface Props {
  children: JSX.Element | Array<JSX.Element>;
  footerComponent: JSX.Element;
}

// This component wraps around a page and forces the provided footer component to always
// be positioned at the base of the page regardless of whether the page's content
// is less then the viewport height. Children of this component will be wrapped by a
// div with display flex on allowing a child element to easily fill the available space
// by setting flexGrow to 1.

const PageWithFooter = ({
  footerComponent,
  children,
  ...props
}: Props): JSX.Element => (
  <Flex
    sx={{
      position: 'relative',
      minHeight: '100vh',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
    {...props}
  >
    <Flex sx={{ flexGrow: 1, flexDirection: 'column' }}>{children}</Flex>
    {footerComponent}
  </Flex>
);

export default PageWithFooter;
