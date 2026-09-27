import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';

interface BadgeProps {
  label: string;
  variant?: 'available' | 'missing' | 'bestMatch' | 'neutral' | 'tag';
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  icon,
  style,
  textStyle,
}) => {
  let backgroundColor = colors.secondary;
  let textColor = colors.primary;
  let defaultIcon: keyof typeof Ionicons.glyphMap | undefined = icon;
  let iconColor = colors.primary;

  switch (variant) {
    case 'available':
      backgroundColor = '#EAF7E8';
      textColor = '#0D5233';
      defaultIcon = icon || 'checkmark-circle';
      iconColor = '#22C55E';
      break;
    case 'missing':
      backgroundColor = '#FFF1E5';
      textColor = '#E65100';
      defaultIcon = icon || 'add-circle';
      iconColor = '#E65100';
      break;
    case 'bestMatch':
      backgroundColor = '#FEF9C3';
      textColor = '#854D0E';
      defaultIcon = icon || 'star';
      iconColor = '#EAB308';
      break;
    case 'tag':
      backgroundColor = '#E9F6EE';
      textColor = colors.primary;
      break;
    case 'neutral':
    default:
      backgroundColor = '#F3F4F6';
      textColor = colors.textSecondary;
      break;
  }

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {defaultIcon && (
        <Ionicons
          name={defaultIcon}
          size={14}
          color={iconColor}
          style={styles.icon}
        />
      )}
      <Text style={[styles.text, { color: textColor }, textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: spacing.radiusPill,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    ...typography.caption,
    fontWeight: '700',
  },
});
