import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../context/AppContext';
import { Header } from '../components/common/Header';
import { RecipeCard } from '../components/recipes/RecipeCard';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { colors, spacing, typography, shadows } from '../theme';

type RecipesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Recipes'
>;

export const RecipesScreen: React.FC = () => {
  const navigation = useNavigation<RecipesScreenNavigationProp>();
  const {
    recipes,
    preferences,
    setSelectedRecipe,
    generateDifferentRecipes,
    favorites,
    toggleFavorite,
    resetToHome,
  } = useApp();

  const [viewMode, setViewMode] = useState<'cards' | 'plan'>('cards');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const handleSelectRecipe = (recipe: typeof recipes[0]) => {
    setSelectedRecipe(recipe);
    navigation.navigate('RecipeDetail', { recipeId: recipe.id });
  };

  const handleRefreshRecipes = () => {
    setRefreshing(true);
    setTimeout(() => {
      generateDifferentRecipes();
      setRefreshing(false);
    }, 400);
  };

  const handleViewShoppingList = () => {
    if (recipes.length > 0) {
      setSelectedRecipe(recipes[0]);
    }
    navigation.navigate('ShoppingList', {});
  };

  const handleStartNewScan = () => {
    resetToHome();
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <Header
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            style={styles.modeToggle}
            onPress={() => setViewMode((prev) => (prev === 'cards' ? 'plan' : 'cards'))}
            activeOpacity={0.7}
          >
            <Ionicons
              name={viewMode === 'cards' ? 'layers-outline' : 'grid-outline'}
              size={18}
              color={colors.primary}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === 'plan' ? (
          /* Plan Ready Layout (Matching Screenshot 1) */
          <View style={styles.planHeaderContainer}>
            {/* Celebration Badge with Confetti Sparkles */}
            <View style={styles.celebrationCircle}>
              <Ionicons name="checkmark" size={26} color={colors.primary} />
            </View>

            <Text style={styles.planTitle}>Your Meal Plan is Ready!</Text>
            <Text style={styles.planSubtitle}>
              We generated 3 delicious recipes using your fridge ingredients.
            </Text>

            {/* 3 Value Cards */}
            <View style={styles.valueRow}>
              <View style={styles.valueCard}>
                <Ionicons name="leaf" size={16} color={colors.primary} />
                <View style={styles.valueTextWrapper}>
                  <Text style={styles.valueTitle}>Save food</Text>
                  <Text style={styles.valueDesc}>Use what you have</Text>
                </View>
              </View>

              <View style={styles.valueCard}>
                <Ionicons name="time-outline" size={16} color={colors.primary} />
                <View style={styles.valueTextWrapper}>
                  <Text style={styles.valueTitle}>Save time</Text>
                  <Text style={styles.valueDesc}>Quick and easy</Text>
                </View>
              </View>

              <View style={styles.valueCard}>
                <Ionicons name="heart" size={16} color="#EF4444" />
                <View style={styles.valueTextWrapper}>
                  <Text style={styles.valueTitle}>Eat better</Text>
                  <Text style={styles.valueDesc}>Delicious & healthy</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          /* Recipes for You Layout (Matching Screenshot 5) */
          <View style={styles.cardsHeaderContainer}>
            <Text style={styles.title}>Recipes for You</Text>
            <Text style={styles.subtitle}>
              Based on what you have in your fridge{'\n'}
              ({preferences.peopleCount} people · {preferences.mealType} · {preferences.preference})
            </Text>
          </View>
        )}

        {/* Recipe Cards List */}
        <View style={styles.recipesList}>
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              variant={viewMode === 'plan' ? 'compact' : 'hero'}
              isFavorite={!!favorites[recipe.id]}
              onToggleFavorite={() => toggleFavorite(recipe.id)}
              onPress={() => handleSelectRecipe(recipe)}
            />
          ))}
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionsBlock}>
          {viewMode === 'plan' ? (
            <>
              <PrimaryButton
                title="View Shopping List"
                icon="restaurant"
                rightIcon="chevron-forward"
                onPress={handleViewShoppingList}
                style={styles.primaryAction}
              />

              <TouchableOpacity
                style={styles.secondaryAction}
                onPress={handleStartNewScan}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={18} color={colors.primary} />
                <Text style={styles.secondaryActionText}>Start New Scan</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <PrimaryButton
                title="Generate Different Recipes"
                icon="sparkles"
                rightIcon="refresh"
                onPress={handleRefreshRecipes}
                loading={refreshing}
                style={styles.primaryAction}
              />

              <TouchableOpacity
                style={styles.secondaryAction}
                onPress={handleViewShoppingList}
                activeOpacity={0.8}
              >
                <Ionicons name="cart-outline" size={18} color={colors.primary} />
                <Text style={styles.secondaryActionText}>View Shopping List</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modeToggle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  cardsHeaderContainer: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title1,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  planHeaderContainer: {
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  celebrationCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#D4EDDA',
  },
  planTitle: {
    ...typography.title1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  planSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  valueRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    backgroundColor: '#F0F9F3',
    padding: 10,
    borderRadius: spacing.radiusLg,
  },
  valueCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  valueTextWrapper: {
    alignItems: 'center',
  },
  valueTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  valueDesc: {
    fontSize: 9,
    color: colors.textSecondary,
  },
  recipesList: {
    marginBottom: spacing.lg,
  },
  actionsBlock: {
    gap: 12,
  },
  primaryAction: {
    width: '100%',
  },
  secondaryAction: {
    height: 52,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryActionText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
});
