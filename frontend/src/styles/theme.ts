import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#E6F6FF',
      100: '#BAE3FF',
      200: '#7CC4FA',
      300: '#47A3F3',
      400: '#2186EB',
      500: '#0967D2',
      600: '#0552B5',
      700: '#03449E',
      800: '#01337D',
      900: '#002159',
    },
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'lg',
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
            _disabled: {
              bg: 'brand.500',
            },
          },
          _active: {
            bg: 'brand.700',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'lg',
          boxShadow: 'sm',
        },
      },
    },
    Tabs: {
      variants: {
        'soft-rounded': {
          tab: {
            borderRadius: 'full',
            fontWeight: 'medium',
            _selected: {
              color: 'blue.600',
              bg: 'blue.50',
            },
          },
        },
      },
    },
    Menu: {
      baseStyle: {
        list: {
          borderRadius: 'lg',
          boxShadow: 'lg',
        },
        item: {
          borderRadius: 'md',
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: 'xl',
        },
      },
    },
    Progress: {
      baseStyle: {
        track: {
          borderRadius: 'full',
        },
        filledTrack: {
          borderRadius: 'full',
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
  layerStyles: {
    card: {
      bg: 'white',
      borderRadius: 'lg',
      boxShadow: 'sm',
      p: 6,
    },
  },
  textStyles: {
    h1: {
      fontSize: ['2xl', '3xl'],
      fontWeight: 'bold',
      lineHeight: 'shorter',
      letterSpacing: 'tight',
    },
    h2: {
      fontSize: ['xl', '2xl'],
      fontWeight: 'semibold',
      lineHeight: 'short',
    },
  },
});

export default theme; 