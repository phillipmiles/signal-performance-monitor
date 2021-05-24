/** @jsx jsx */
import { faChartBar } from '@fortawesome/free-regular-svg-icons';
import { useState } from 'react';
import { jsx } from 'theme-ui';
import ButtonIcon from './ButtonIcon';
import TetherExpander from './TetherExpander.stories';
import { ExampleMenu } from './Tether.stories';

export default {
  title: 'Elements/TetherExpander',

  parameters: {
    component: TetherExpander,
  },
};

const Interactive = () => {
  const [isOpen, setOpenMenu] = useState(false);

  return (
    <TetherExpander
      visible={isOpen}
      sourceAnchorCoord={{ x: '100%', y: '100%' }}
      tetherComponent={<ExampleMenu />}
    >
      <ButtonIcon
        icon={faChartBar}
        ariaLabel="Aria text"
        onClick={() => setOpenMenu((prevState) => !prevState)}
      />
    </TetherExpander>
  );
};

export const interactive = () => <Interactive />;

export const fitInViewport = () => (
  <TetherExpander
    visible
    fitInViewport
    sourceAnchorCoord={{ x: '100%', y: '100%' }}
    tetherAnchorCoord={{ x: '100%', y: '0' }}
    tetherComponent={<ExampleMenu />}
  >
    <ButtonIcon icon={faChartBar} ariaLabel="Aria text" />
  </TetherExpander>
);
