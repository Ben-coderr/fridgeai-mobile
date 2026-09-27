import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PreferenceType } from '../../types';
import { colors, spacing, typography } from '../../theme';

interface PreferenceButtonProps {
  selected: PreferenceType;
  onSelect: (pref: PreferenceType) => void;
}

interface PreferenceOption {
  type: PreferenceType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const preferenceOptions: PreferenceOption[] = [
  { type: 'Quick', label: 'Quick', icon: 'flash-outline' },
  { type: 'Healthy', label: 'Healthy', icon: 'leaf-outline' },
  { type: 'High Protein', label: 'High Protein', icon: 'barbell-outline' },
  { type: 'Budget', label: 'Budget', icon: 'wallet-outline' },
];

export const PreferenceChips: React.FC<PreferenceButtonProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      {preferenceOptions.map((option) => {
        const isSelected = selected === option.type;
        return (
          <TouchableOpacity
            key={option.type}
            style={[
              styles.chip,
              isSelected ? styles.chipSelected : styles.chipUnselected,
            ]}
            onPress={() => onSelect(option.type)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={option.icon}
              size={15}
              color={isSelected ? colors.primary : colors.textSecondary}
              style={styles.icon}
            />
            <Text
              style={[
                styles.label,
                isSelected ? styles.labelSelected : styles.labelUnselected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: spacing.radiusMd,
    borderWidth: 1.5,
  },
  chipUnselected: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.primary,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
  },
  labelUnselected: {
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
});
