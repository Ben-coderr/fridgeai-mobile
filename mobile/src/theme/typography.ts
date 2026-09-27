import { TextStyle } from 'react-native';

export const typography = {
  // Font sizes
  sizes: {
    hero: 34,
    title1: 28,
    title2: 22,
    title3: 18,
    bodyLarge: 16,
    body: 15,
    bodySmall: 13,
    caption: 12,
    tiny: 10,
  },
  // Font weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
  // Reusable text presets
  hero: {
    fontSize: 34,
    fontWeight: '800' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  } as TextStyle,
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: -0.3,
  } as TextStyle,
  title2: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
    letterSpacing: -0.2,
  } as TextStyle,
  title3: {
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 24,
  } as TextStyle,
  bodyLarge: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 22,
  } as TextStyle,
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  } as TextStyle,
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  } as TextStyle,
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  } as TextStyle,
};
