/** @jsx jsx */
import { faChartBar } from '@fortawesome/free-regular-svg-icons';
import { jsx, Flex } from 'theme-ui';
import ButtonIcon from './ButtonIcon';

import Tether from './Tether';

export default {
  title: 'Elements/Tether',

  parameters: {
    component: Tether,
  },
};

const ExampleMenu = () => <div>Hello</div>;

export const Normal = () => (
  <Flex sx={{ justifyContent: 'flex-start' }}>
    <Tether
      tetherComponent={<ExampleMenu />}
      sourceAnchorCoord={{ x: '100%', y: '100%' }}
      tetherAnchorCoord={{ x: '100%', y: '0' }}
    >
      <ButtonIcon icon={faChartBar} ariaLabel="Aria text" />
    </Tether>
  </Flex>
);

export const fitInViewport = () => (
  <Flex sx={{ justifyContent: 'flex-start' }}>
    <Tether
      tetherComponent={<ExampleMenu />}
      fitInViewport
      sourceAnchorCoord={{ x: '100%', y: '100%' }}
      tetherAnchorCoord={{ x: '100%', y: '0' }}
    >
      <ButtonIcon icon={faChartBar} ariaLabel="Aria text" />
    </Tether>
  </Flex>
);
