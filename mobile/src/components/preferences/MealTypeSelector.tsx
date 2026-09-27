import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MealType } from '../../types';
import { colors, spacing, typography } from '../../theme';

interface MealTypeSelectorProps {
  selected: MealType;
  onSelect: (type: MealType) => void;
}

interface MealOption {
  type: MealType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

const mealOptions: MealOption[] = [
  {
    type: 'Breakfast',
    label: 'Breakfast',
    icon: 'sunny-outline',
    iconColor: '#F59E0B',
  },
  {
    type: 'Lunch',
    label: 'Lunch',
    icon: 'partly-sunny-outline',
    iconColor: '#EAB308',
  },
  {
    type: 'Dinner',
    label: 'Dinner',
    icon: 'moon-outline',
    iconColor: '#0D5233',
  },
];

export const MealTypeSelector: React.FC<MealTypeSelectorProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      {mealOptions.map((option) => {
        const isSelected = selected === option.type;
        return (
          <TouchableOpacity
            key={option.type}
            style={[
              styles.card,
              isSelected ? styles.cardSelected : styles.cardUnselected,
            ]}
            onPress={() => onSelect(option.type)}
            activeOpacity={0.75}
          >
            <Ionicons
              name={option.icon}
              size={22}
              color={isSelected ? colors.primary : option.iconColor}
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
    gap: 10,
    marginTop: spacing.xs,
  },
  card: {
    flex: 1,
    height: 64,
    borderRadius: spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  cardUnselected: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.border,
  },
  cardSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.primary,
  },
  icon: {
    marginBottom: 4,
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
