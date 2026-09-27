import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows } from '../../theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  icon,
  rightIcon,
  loading = false,
  disabled = false,
  style,
  textStyle,
  variant = 'primary',
}) => {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';

  const containerStyles = [
    styles.container,
    isPrimary && styles.primaryContainer,
    isSecondary && styles.secondaryContainer,
    isOutline && styles.outlineContainer,
    isDanger && styles.dangerContainer,
    disabled && styles.disabledContainer,
    isPrimary && shadows.button,
    style,
  ];

  const labelStyles = [
    styles.text,
    isPrimary && styles.primaryText,
    isSecondary && styles.secondaryText,
    isOutline && styles.outlineText,
    isDanger && styles.dangerText,
    disabled && styles.disabledText,
    textStyle,
  ];

  const iconColor = isPrimary
    ? colors.textWhite
    : isSecondary
    ? colors.primary
    : isOutline
    ? colors.textPrimary
    : colors.danger;

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.textWhite : colors.primary} />
      ) : (
        <View style={styles.contentRow}>
          {icon && (
            <Ionicons
              name={icon}
              size={19}
              color={iconColor}
              style={styles.leftIcon}
            />
          )}
          <Text style={labelStyles}>{title}</Text>
          {rightIcon && (
            <Ionicons
              name={rightIcon}
              size={18}
              color={iconColor}
              style={styles.rightIcon}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: spacing.radiusPill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
  },
  primaryContainer: {
    backgroundColor: colors.primary,
  },
  secondaryContainer: {
    backgroundColor: colors.secondary,
  },
  outlineContainer: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  dangerContainer: {
    backgroundColor: '#FEE2E2',
  },
  disabledContainer: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.bodyLarge,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  primaryText: {
    color: colors.textWhite,
  },
  secondaryText: {
    color: colors.primary,
  },
  outlineText: {
    color: colors.textPrimary,
  },
  dangerText: {
    color: colors.danger,
  },
  disabledText: {
    color: colors.textMuted,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
});
