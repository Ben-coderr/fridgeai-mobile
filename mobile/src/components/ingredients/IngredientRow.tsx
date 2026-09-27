import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ingredient } from '../../types';
import { QuantityStepper } from '../common/QuantityStepper';
import { colors, spacing, typography, shadows } from '../../theme';

interface IngredientRowProps {
  ingredient: Ingredient;
  onIncrement: () => void;
  onDecrement: () => void;
  onDelete: () => void;
}

export const IngredientRow: React.FC<IngredientRowProps> = ({
  ingredient,
  onIncrement,
  onDecrement,
  onDelete,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: ingredient.image }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {ingredient.name}
        </Text>
        <Text style={styles.unit}>
          {ingredient.quantity} {ingredient.unit}
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        <QuantityStepper
          value={ingredient.quantity}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radiusLg,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.soft,
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: spacing.radiusMd,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    marginRight: spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  unit: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
