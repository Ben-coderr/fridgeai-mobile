import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShoppingItem } from '../../types';
import { QuantityStepper } from '../common/QuantityStepper';
import { colors, spacing, typography } from '../../theme';

interface ShoppingItemRowProps {
  item: ShoppingItem;
  onToggle: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const ShoppingItemRow: React.FC<ShoppingItemRowProps> = ({
  item,
  onToggle,
  onIncrement,
  onDecrement,
}) => {
  return (
    <View style={styles.container}>
      {/* Checkbox */}
      <TouchableOpacity
        style={[styles.checkbox, item.isPurchased && styles.checkboxChecked]}
        onPress={onToggle}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {item.isPurchased && (
          <Ionicons name="checkmark" size={14} color={colors.textWhite} />
        )}
      </TouchableOpacity>

      {/* Food thumbnail */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Title & Unit */}
      <View style={styles.info}>
        <Text
          style={[styles.name, item.isPurchased && styles.namePurchased]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text style={styles.unit}>
          {item.quantity} {item.unit}
        </Text>
      </View>

      {/* Stepper */}
      <QuantityStepper
        value={item.quantity}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        size="small"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.8,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: colors.cardBackground,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  imageContainer: {
    width: 44,
    height: 44,
    borderRadius: spacing.radiusMd,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  namePurchased: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  unit: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
