export const COLORS = {
  primary: '#3498db',
  accent: '#f39c12',
  white: '#ffffff',
  black: '#000000',
  gray: '#7f8c8d',
  
  // Status colors
  success: '#4CAF50',
  info: '#2196F3',
  warning: '#FFC107',
  error: '#F44336',
  
  // Map specific
  trailPath: '#3498db',
  trailStart: '#2ecc71',
  trailEnd: '#e74c3c',
  
  // Additional colors for backward compatibility
  primaryLight: '#6ABF69',
  primaryDark: '#00600F',
  secondaryLight: '#FFD149',
  secondaryDark: '#C67100',
  lightGray: '#F5F5F5',
  mediumGray: '#E0E0E0',
  darkGray: '#757575',
  grayLight: '#E0E0E0',
  grayLighter: '#F5F5F5',
  text: '#000000',
  textSecondary: '#757575',
  background: '#FFFFFF',
  surface: '#FAFAFA',
  border: '#E0E0E0',
  divider: '#EEEEEE',
  rating: '#FFC07F',
  accent2: '#8BC34A',     // Light Green
  accent3: '#CDDC39',     // Lime
  accent4: '#FFC107',     // Amber
  accent5: '#FF9800',     // Orange
  
  // Social media
  facebook: '#3B5998',
  google: '#DB4437',
  apple: '#000000',
  
  // Transparent
  transparent: 'transparent',
  semiTransparent: 'rgba(0, 0, 0, 0.5)',
  
  // Gradient colors
  gradientStart: '#4CAF50',
  gradientEnd: '#388E3C',
} as const;

// Type for the colors object
export type Colors = typeof COLORS;

// Type for color keys
export type ColorKey = keyof Colors;

// Helper function to get a color value
export const getColor = (key: ColorKey): string => COLORS[key];
