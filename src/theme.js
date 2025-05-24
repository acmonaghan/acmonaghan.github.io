// theme.js

// 1. import `extendTheme` function
import { extendTheme } from "@chakra-ui/react";

// 2. Add your color mode config
const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};
// 3. Typography
const fonts = {
  heading: `'Space Grotesk', sans-serif`,
  body: `'DM Sans', sans-serif`,
};

// 4. Component styles
const components = {
  Button: {
    variants: {
      gradient: {
        bgGradient: "linear(to-r, space.500, nebula.500)",
        color: "white",
        _hover: {
          bgGradient: "linear(to-r, space.600, nebula.600)",
          transform: "translateY(-2px)",
          boxShadow: "0 4px 12px rgba(50, 67, 255, 0.3)",
        },
      },
    },
  },
  Heading: {
    baseStyle: {
      letterSpacing: "wider",
      fontWeight: "bold",
    },
  },
  Link: {
    baseStyle: {
      _hover: {
        textDecoration: "none",
        color: "space.300",
        textShadow: "0 0 8px rgba(50, 67, 255, 0.5)",
      },
    },
  },
};



// 6. Extend the theme
const theme = extendTheme({
  config,
  fonts,
  components,
});

export default theme;
