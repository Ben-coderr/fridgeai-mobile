import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../context/AppContext';
import { Header } from '../components/common/Header';
import { QuantityStepper } from '../components/common/QuantityStepper';
import { MealTypeSelector } from '../components/preferences/MealTypeSelector';
import { PreferenceChips } from '../components/preferences/PreferenceButton';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { colors, spacing, typography, shadows } from '../theme';

import { recipeService } from '../services/recipeService';

type PreferencesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Preferences'
>;

export const PreferencesScreen: React.FC = () => {
  const navigation = useNavigation<PreferencesScreenNavigationProp>();
  const { preferences, ingredients, setRecipes, setSelectedRecipe, setPeopleCount, setMealType, setPreference } = useApp();
  const [loading, setLoading] = useState<boolean>(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const generated = await recipeService.getRecipes(preferences, ingredients);
      if (generated && generated.length > 0) {
        setRecipes(generated);
        setSelectedRecipe(generated[0]);
      }
    } catch (err) {
      console.warn('[PreferencesScreen] Error generating recipes:', err);
    } finally {
      setLoading(false);
      navigation.navigate('Recipes');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <Header onBack={() => navigation.goBack()} title="Meal Preferences" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Meal Preferences</Text>
          <Text style={styles.subtitle}>
            Tell us a bit more so we can create the best recipes for you.
          </Text>
        </View>

        {/* Number of People */}
        <View style={styles.card}>
          <Text style={styles.label}>Number of people</Text>
          <QuantityStepper
            value={preferences.peopleCount}
            onIncrement={() => setPeopleCount(preferences.peopleCount + 1)}
            onDecrement={() => setPeopleCount(preferences.peopleCount - 1)}
            size="large"
            min={1}
            max={12}
          />
        </View>

        {/* Meal Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal type</Text>
          <MealTypeSelector
            selected={preferences.mealType}
            onSelect={setMealType}
          />
        </View>

        {/* Preference (optional) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Preference <Text style={styles.optional}>(optional)</Text>
          </Text>
          <PreferenceChips
            selected={preferences.preference}
            onSelect={setPreference}
          />
        </View>

        <PrimaryButton
          title="Generate Recipes"
          icon="sparkles"
          rightIcon="chevron-forward"
          onPress={handleGenerate}
          loading={loading}
          style={styles.ctaButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  headerBlock: {
    marginTop: spacing.sm,
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
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    padding: spacing.lg,
    borderRadius: spacing.radiusLg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
    ...shadows.soft,
  },
  label: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  optional: {
    fontWeight: '400',
    color: colors.textMuted,
    fontSize: 12,
  },
  ctaButton: {
    marginTop: spacing.md,
    width: '100%',
  },
});
