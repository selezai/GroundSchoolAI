import { Platform } from 'react-native';

export const theme = {
  colors: {
    primary: '#1E3A8A', // Deep blue
    secondary: '#3B82F6', // Sky blue
    accent: '#F97316', // Orange
    background: '#F8FAFC', // Light gray
    surface: '#FFFFFF',
    text: '#1F2937',
    disabled: '#9CA3AF',
    border: '#E5E7EB',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: 28,
      fontWeight: 'bold',
    },
    h3: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    h4: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    body: {
      fontSize: 16,
    },
    caption: {
      fontSize: 14,
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
    sm: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
      },
      android: {
        elevation: 2,
      },
    }),
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
    lg: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 8,
      },
    }),
  },
};
