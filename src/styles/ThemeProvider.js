import React from 'react';
import { ThemeProvider as TP } from 'theme-ui';
import theme from './theme';
import PropTypes from 'prop-types';
import FontLoader from './FontLoader';

const ThemeProvider = ({ children }) => (
  <FontLoader>
    <TP theme={theme}>{children}</TP>
  </FontLoader>
);

ThemeProvider.propTypes = {
  children: PropTypes.node,
};

export default ThemeProvider;
