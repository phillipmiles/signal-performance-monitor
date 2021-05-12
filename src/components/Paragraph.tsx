/** @jsx jsx */
import { jsx } from 'theme-ui';
import { node } from 'prop-types';

interface Props {
  children?: JSX.Element;
}

const Paragraph = ({ children, ...props }: Props): JSX.Element => {
  return (
    <p {...props} sx={{}}>
      {children}
    </p>
  );
};

Paragraph.propTypes = {
  children: node,
};

export default Paragraph;
