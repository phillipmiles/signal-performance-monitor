export default {
  space: [0, 4, 8, 16, 24, 32, 48, 64, 96, 128, 256, 512],
  sizes: {
    0: 0,
    1: 16,
    2: 24,
    3: 32,
    4: 40,
    5: 48,
    6: 56,
    7: 64,
    8: 96,
    9: 128,
    10: 192,
    11: 256,
    12: 360,
    13: 512,
    14: 928,
    contentSmall: 680,
    // content: 1080,
    content: 1140,
  },
  fonts: {
    body: 'Inter, system-ui, sans-serif',
    heading: 'Inter, sans-serif',
    // body: 'Droid Sans, system-ui, sans-serif',
    // heading: 'Droid Serif, sans-serif',
    // Menlo is only for Mac OSX Snow Leopard only.
    monospace: 'Menlo, monospace',
  },
  // These are fontSize for display / promotion pages.
  // fontSizes: [15, 17, 19, 22, 28, 36, 44, 56, 68],
  fontSizes: [13, 15, 18, 21, 25, 31, 37, 44, 56],
  fontWeights: {
    regular: 400,
    bold: 700,
  },
  lineHeights: {
    none: 1,
    tight: 1.125,
    normal: 1.6,
  },
  // letterSpacings: {
  //   body: 'normal',
  //   caps: '0.2em',
  // },
  text: {
    heading1: {
      fontFamily: 'heading',
      fontSize: 7,
      lineHeight: 'tight',
      fontWeight: 'bold',
    },
    heading2: {
      fontFamily: 'heading',
      fontSize: 6,
      lineHeight: 'tight',
      fontWeight: 'bold',
    },
    heading3: {
      fontFamily: 'heading',
      fontSize: 5,
      lineHeight: 'tight',
      fontWeight: 'bold',
    },
    heading4: {
      fontFamily: 'heading',
      fontSize: 4,
      lineHeight: 'tight',
      fontWeight: 'bold',
    },
    heading5: {
      fontFamily: 'heading',
      fontSize: 3,
      lineHeight: 'tight',
      fontWeight: 'bold',
    },
    heading6: {
      fontFamily: 'heading',
      fontSize: 2,
      lineHeight: 'tight',
      fontWeight: 'bold',
    },
    bodySmall: {
      fontFamily: 'body',
      fontSize: 1,
      lineHeight: 'normal',
      fontWeight: 'regular',
    },
    body: {
      fontFamily: 'body',
      fontSize: 1,
      lineHeight: 'normal',
      fontWeight: 'regular',
    },
    // Also could be called bodyLarge
    callout: {
      fontFamily: 'body',
      fontSize: 3,
      lineHeight: 'normal',
      fontWeight: 'regular',
    },
    detail: {
      fontFamily: 'body',
      fontSize: 0,
      lineHeight: 'normal',
      fontWeight: 'regular',
    },
  },
  colors: {
    white: '#ffffff',
    black: '#262C35',
    text: '#262C35',
    background: '#fff',
    primary: '#007BE4',
    primaryLight: '#59B3FF',
    secondary: '#FFC700',
    neutral: [
      '',
      '',
      '',
      '',
      '',
      '',
      '#8EADCD',
      '#98A3B2',
      '#D4DBE6',
      '#ECF4FA',
      '',
    ],
  },
  styles: {
    // Global styles applied to the body element.
    root: {
      fontFamily: 'body',
      fontWeight: 'body',
      fontSize: 1,

      '*': {
        WebkitFontSmoothing: 'antialiased !important',
        MozOsxFontSmoothing: 'grayscale !important',
        textRendering: 'optimizelegibility !important',
      },

      'h1, h2, h3, h4, h5, h6': {
        margin: 0,
      },

      p: {
        mt: 0,
        mb: 4,
      },

      a: {
        textDecoration: 'none',
        color: 'black',
        cursor: 'pointer',
      },

      img: {
        // Removes small bottom margin.
        display: 'block',
      },

      pre: {
        margin: 0,
      },
    },
  },
  forms: {
    input: {
      bg: 'white',
      height: 56,
      borderRadius: 32,
      pl: 4,
      pr: 4,
      color: 'text',
      fontFamily: 'body',
      borderWidth: 0,
      ':focus': {
        borderColor: 'primary',
        outline: 'none',
      },
      '::placeholder': {
        color: 'neutral.6',
        opacity: 1,
      },
    },
  },
  easing: {
    slowToQuickToSlow: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  },
};
