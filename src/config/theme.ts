import { Platform } from 'react-native';
import { DefaultTheme } from '@react-navigation/native';

export const theme = {
  ...DefaultTheme,
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    accent: '#FF2D55',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    text: '#000000',
    disabled: '#C7C7CC',
    border: '#E5E5EA',
    error: '#FF3B30',
    warning: '#FF9500',
    success: '#34C759',
    grey3: '#C7C7CC',
    grey5: '#E5E5EA',
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700' as const,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600' as const,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    md: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  }
} as const;

export type Theme = typeof theme;
