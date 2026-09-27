import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  rightText?: string;
  onRightPress?: () => void;
  transparent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  rightAction,
  rightText,
  onRightPress,
  transparent = false,
}) => {
  return (
    <View style={[styles.container, transparent && styles.transparent]}>
      <View style={styles.leftContainer}>
        {onBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {title ? (
        <View style={styles.centerContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
      ) : (
        <View style={styles.centerPlaceholder} />
      )}

      <View style={styles.rightContainer}>
        {rightAction ? (
          rightAction
        ) : rightText ? (
          <TouchableOpacity onPress={onRightPress} activeOpacity={0.7}>
            <Text style={styles.rightText}>{rightText}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  leftContainer: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    width: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  centerPlaceholder: {
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  title: {
    ...typography.title3,
    color: colors.textPrimary,
  },
  rightText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
});
