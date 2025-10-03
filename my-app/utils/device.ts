import { useWindowDimensions } from 'react-native';

/**
 * Device utility functions for responsive design
 */

// Hook to get current device type
export function useDeviceType() {
  const { width } = useWindowDimensions();
  
  return {
    isTablet: width >= 768,
    isMobile: width < 768,
    isLargeTablet: width >= 1024,
    width,
  };
}

// Static function for non-hook contexts (use sparingly)
export function getDeviceType(width: number) {
  return {
    isTablet: width >= 768,
    isMobile: width < 768,
    isLargeTablet: width >= 1024,
    width,
  };
}

// Breakpoints for consistent responsive design
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  largeTablet: 1024,
  desktop: 1200,
} as const;

// Helper function to get responsive values
export function getResponsiveValue<T>(
  mobileValue: T,
  tabletValue: T,
  width: number
): T {
  return width >= BREAKPOINTS.tablet ? tabletValue : mobileValue;
}