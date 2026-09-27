import { ViewStyle } from 'react-native';

export const shadows = {
  soft: {
    shadowColor: '#1A2D23',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  } as ViewStyle,
  medium: {
    shadowColor: '#1A2D23',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  } as ViewStyle,
  large: {
    shadowColor: '#1A2D23',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  } as ViewStyle,
  card: {
    shadowColor: '#1A2D23',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  } as ViewStyle,
  button: {
    shadowColor: '#0D5233',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  } as ViewStyle,
};
