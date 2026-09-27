import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { colors, spacing, typography, shadows } from '../theme';

type RecipeDetailRouteProp = RouteProp<RootStackParamList, 'RecipeDetail'>;
type RecipeDetailNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RecipeDetail'
>;

export const RecipeDetailScreen: React.FC = () => {
  const navigation = useNavigation<RecipeDetailNavigationProp>();
  const route = useRoute<RecipeDetailRouteProp>();
  const { selectedRecipe, recipes, favorites, toggleFavorite } = useApp();

  // Find recipe by param or use active selectedRecipe
  const recipeId = route.params?.recipeId;
  const currentRecipe = recipes.find((r) => r.id === recipeId) || selectedRecipe;
  const isFavorite = !!favorites[currentRecipe.id];

  const handleAddMissingToShopping = () => {
    navigation.navigate('ShoppingList', { recipeId: currentRecipe.id });
  };

  const handleOpenInstructions = () => {
    navigation.navigate('CookingInstructions', { recipeId: currentRecipe.id });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Hero Image with Gradient */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: currentRecipe.image }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(10,30,20,0.92)']}
            style={styles.gradientOverlay}
          />

          {/* Floating Back & Favorite buttons */}
          <SafeAreaView style={styles.floatingNav} edges={['top']}>
            <TouchableOpacity
              style={styles.navCircleButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navCircleButton}
              onPress={() => toggleFavorite(currentRecipe.id)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? '#EF4444' : colors.textPrimary}
              />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Recipe Hero Info on Gradient */}
          <View style={styles.heroInfoBlock}>
            <Text style={styles.recipeTitle}>{currentRecipe.title}</Text>
            <Text style={styles.recipeDescription} numberOfLines={2}>
              {currentRecipe.description}
            </Text>

            {/* Metadata Badges */}
            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <Ionicons name="time-outline" size={14} color={colors.textWhite} />
                <Text style={styles.metaPillText}>{currentRecipe.cookingTime} min</Text>
              </View>

              <View style={styles.metaPill}>
                <Ionicons name="person-outline" size={14} color={colors.textWhite} />
                <Text style={styles.metaPillText}>{currentRecipe.servings} servings</Text>
              </View>

              <View style={styles.metaPill}>
                <Ionicons name="restaurant-outline" size={14} color={colors.textWhite} />
                <Text style={styles.metaPillText}>{currentRecipe.difficulty}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.bodyContent}>
          {/* Ingredients Section Header */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="cart" size={20} color={colors.textPrimary} />
              <Text style={styles.sectionHeading}>Ingredients</Text>
            </View>

            <View style={styles.headerBadgesRow}>
              <Badge
                label={`${currentRecipe.availableIngredients.length} you have`}
                variant="available"
              />
              <Badge
                label={`${currentRecipe.missingIngredients.length} missing`}
                variant="missing"
              />
            </View>
          </View>

          {/* Two-Column Side-by-Side Ingredients Cards */}
          <View style={styles.twoColumnContainer}>
            {/* Column 1: You Have */}
            <View style={[styles.columnCard, styles.haveCard]}>
              <Text style={styles.columnTitleHave}>
                You have ({currentRecipe.availableIngredients.length})
              </Text>

              {currentRecipe.availableIngredients.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemThumbWrapper}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.itemThumb}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.itemTextContainer}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemQuantity}>
                      {item.quantity} {item.unit}
                    </Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={17} color="#22C55E" />
                </View>
              ))}
            </View>

            {/* Column 2: Missing */}
            <View style={[styles.columnCard, styles.missingCard]}>
              <Text style={styles.columnTitleMissing}>
                Missing ({currentRecipe.missingIngredients.length})
              </Text>

              {currentRecipe.missingIngredients.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemThumbWrapper}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.itemThumb}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.itemTextContainer}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemQuantity}>
                      {item.quantity} {item.unit}
                    </Text>
                  </View>
                  <Ionicons name="add-circle" size={17} color="#E65100" />
                </View>
              ))}
            </View>
          </View>

          {/* Instructions Section Header */}
          <View style={styles.instructionsHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="clipboard-outline" size={20} color={colors.textPrimary} />
              <Text style={styles.sectionHeading}>Instructions</Text>
            </View>

            <TouchableOpacity
              onPress={handleOpenInstructions}
              activeOpacity={0.7}
              style={styles.viewTimelineLink}
            >
              <Text style={styles.viewTimelineText}>Step-by-step</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Vertical Timeline Cooking Steps */}
          <View style={styles.timelineContainer}>
            {currentRecipe.instructions.map((stepItem, index) => {
              const isLast = index === currentRecipe.instructions.length - 1;

              return (
                <View key={stepItem.id} style={styles.timelineRow}>
                  <View style={styles.timelineIndicatorCol}>
                    <View style={styles.stepNumberCircle}>
                      <Text style={styles.stepNumberText}>{stepItem.step}</Text>
                    </View>
                    {!isLast && <View style={styles.stepConnectingLine} />}
                  </View>

                  <View style={styles.stepContentCol}>
                    <Text style={styles.stepText}>{stepItem.description}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Spacer for sticky CTA button */}
          <View style={{ height: 90 }} />
        </View>
      </ScrollView>

      {/* Floating Bottom Sticky CTA Button */}
      <View style={styles.stickyBottomBar}>
        <PrimaryButton
          title="Add Missing Items to Shopping List"
          icon="cart"
          rightIcon="chevron-forward"
          onPress={handleAddMissingToShopping}
          style={styles.stickyCTA}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  heroContainer: {
    height: 320,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
  },
  floatingNav: {
    position: 'absolute',
    top: 10,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  navCircleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  heroInfoBlock: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },
  recipeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textWhite,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  recipeDescription: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: spacing.radiusPill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  metaPillText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textWhite,
  },
  bodyContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeading: {
    ...typography.title2,
    color: colors.textPrimary,
  },
  headerBadgesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  twoColumnContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.xl,
  },
  columnCard: {
    flex: 1,
    borderRadius: spacing.radiusLg,
    padding: 12,
  },
  haveCard: {
    backgroundColor: '#EAF7E8',
  },
  missingCard: {
    backgroundColor: '#FFF1E5',
  },
  columnTitleHave: {
    ...typography.caption,
    fontWeight: '700',
    color: '#0D5233',
    marginBottom: spacing.sm,
  },
  columnTitleMissing: {
    ...typography.caption,
    fontWeight: '700',
    color: '#E65100',
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  itemThumbWrapper: {
    width: 28,
    height: 28,
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  itemThumb: {
    width: '100%',
    height: '100%',
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemQuantity: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  instructionsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  viewTimelineLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewTimelineText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 48,
  },
  timelineIndicatorCol: {
    alignItems: 'center',
    width: 32,
    marginRight: 10,
  },
  stepNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EAF7E8',
    borderWidth: 1.5,
    borderColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  stepConnectingLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#D1E7DD',
    marginVertical: 4,
  },
  stepContentCol: {
    flex: 1,
    paddingBottom: 14,
  },
  stepText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    lineHeight: 19,
  },
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    backgroundColor: 'rgba(249, 247, 243, 0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  stickyCTA: {
    width: '100%',
  },
});
