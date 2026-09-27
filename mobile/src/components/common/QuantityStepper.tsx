import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';

interface QuantityStepperProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  onIncrement,
  onDecrement,
  min = 1,
  max = 99,
  style,
  size = 'small',
}) => {
  const isLarge = size === 'large';
  const isMedium = size === 'medium';

  return (
    <View
      style={[
        styles.container,
        isMedium && styles.containerMedium,
        isLarge && styles.containerLarge,
        style,
      ]}
    >
      <TouchableOpacity
        style={[styles.button, value <= min && styles.buttonDisabled]}
        onPress={onDecrement}
        disabled={value <= min}
        activeOpacity={0.6}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Ionicons
          name="remove"
          size={isLarge ? 20 : 16}
          color={value <= min ? colors.textMuted : colors.textPrimary}
        />
      </TouchableOpacity>

      <Text
        style={[
          styles.valueText,
          isMedium && styles.valueTextMedium,
          isLarge && styles.valueTextLarge,
        ]}
      >
        {value}
      </Text>

      <TouchableOpacity
        style={[styles.button, value >= max && styles.buttonDisabled]}
        onPress={onIncrement}
        disabled={value >= max}
        activeOpacity={0.6}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Ionicons
          name="add"
          size={isLarge ? 20 : 16}
          color={value >= max ? colors.textMuted : colors.textPrimary}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: spacing.radiusPill,
    paddingHorizontal: 6,
    height: 34,
    minWidth: 92,
  },
  containerMedium: {
    height: 42,
    minWidth: 110,
    paddingHorizontal: 8,
  },
  containerLarge: {
    height: 48,
    minWidth: 130,
    paddingHorizontal: 12,
  },
  button: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  valueText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },
  valueTextMedium: {
    fontSize: 16,
  },
  valueTextLarge: {
    fontSize: 18,
    fontWeight: '800',
  },
});
