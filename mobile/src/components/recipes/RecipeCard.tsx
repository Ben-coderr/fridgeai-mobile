import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Recipe } from '../../types';
import { Badge } from '../common/Badge';
import { colors, spacing, typography, shadows } from '../../theme';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  variant?: 'hero' | 'compact';
  style?: ViewStyle;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onPress,
  onToggleFavorite,
  isFavorite = false,
  variant = 'hero',
  style,
}) => {
  const isCompact = variant === 'compact';

  if (isCompact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, style]}
        onPress={onPress}
        activeOpacity={0.88}
      >
        <Image
          source={{ uri: recipe.image }}
          style={styles.compactImage}
          resizeMode="cover"
        />

        <View style={styles.compactContent}>
          {recipe.isBestMatch && (
            <Badge
              label="Best match"
              variant="bestMatch"
              style={styles.compactBadge}
            />
          )}

          <Text style={styles.compactTitle} numberOfLines={1}>
            {recipe.title}
          </Text>

          <Text style={styles.compactDescription} numberOfLines={2}>
            {recipe.description}
          </Text>

          {/* Metadata row */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
              <Text style={styles.metaText}>{recipe.cookingTime} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={13} color={colors.textSecondary} />
              <Text style={styles.metaText}>{recipe.servings} servings</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="restaurant-outline" size={13} color={colors.textSecondary} />
              <Text style={styles.metaText}>{recipe.difficulty}</Text>
            </View>
          </View>

          {/* Availability Pills */}
          <View style={styles.compactBadgeRow}>
            <Badge
              label={`${recipe.availableIngredients.length} available`}
              variant="available"
            />
            <Badge
              label={`${recipe.missingIngredients.length} missing`}
              variant="missing"
            />
          </View>
        </View>

        <View style={styles.chevronContainer}>
          <View style={styles.chevronButton}>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Hero Card Layout (Matching Screenshot 5)
  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.92}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: recipe.image }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Favorite heart button */}
        {onToggleFavorite && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onToggleFavorite}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? '#EF4444' : colors.textPrimary}
            />
          </TouchableOpacity>
        )}

        {/* Time Badge on image */}
        <View style={styles.timeBadge}>
          <Ionicons name="time-outline" size={13} color={colors.textPrimary} />
          <Text style={styles.timeBadgeText}>{recipe.cookingTime} min</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {recipe.title}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {recipe.description}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.badgesGroup}>
            <Badge
              label={`${recipe.availableIngredients.length} available`}
              variant="available"
            />
            <Badge
              label={`${recipe.missingIngredients.length} missing`}
              variant="missing"
            />
          </View>

          <View style={styles.chevronButton}>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radiusCard,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  imageContainer: {
    height: 155,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  timeBadge: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: spacing.radiusPill,
    gap: 4,
  },
  timeBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    ...typography.title3,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgesGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chevronButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Compact Layout Styles
  compactCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radiusCard,
    padding: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  compactImage: {
    width: 96,
    height: 96,
    borderRadius: spacing.radiusMd,
  },
  compactContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  compactBadge: {
    marginBottom: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  compactTitle: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  compactDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  compactBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  chevronContainer: {
    justifyContent: 'center',
    marginLeft: 6,
  },
});
