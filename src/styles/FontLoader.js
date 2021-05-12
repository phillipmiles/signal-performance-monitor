import { useEffect } from 'react';
import WebFont from 'webfontloader';

const FontLoader = ({ children }) => {
  useEffect(() => {
    WebFont.load({
      google: {
        families: ['Droid Sans', 'Droid Serif'],
      },
    });
  }, []);

  return children;
};

export default FontLoader;
