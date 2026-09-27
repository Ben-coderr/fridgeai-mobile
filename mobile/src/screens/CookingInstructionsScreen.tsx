import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../context/AppContext';
import { Header } from '../components/common/Header';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { recipeService } from '../services/recipeService';
import { RecipeStep } from '../types';
import { colors, spacing, typography, shadows } from '../theme';

type CookingInstructionsRouteProp = RouteProp<
  RootStackParamList,
  'CookingInstructions'
>;
type CookingInstructionsNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'CookingInstructions'
>;

export const CookingInstructionsScreen: React.FC = () => {
  const navigation = useNavigation<CookingInstructionsNavProp>();
  const route = useRoute<CookingInstructionsRouteProp>();
  const { selectedRecipe, recipes } = useApp();

  const recipeId = route.params?.recipeId;
  const currentRecipe = recipes.find((r) => r.id === recipeId) || selectedRecipe;

  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [instructions, setInstructions] = useState<RecipeStep[]>(currentRecipe.instructions || []);

  useEffect(() => {
    let active = true;
    recipeService.getInstructions(currentRecipe).then((result) => {
      if (active) setInstructions(result);
    }).catch((error: unknown) => {
      if (active) Alert.alert('Could not load instructions', error instanceof Error ? error.message : 'Check your backend connection and try again.');
    });
    return () => { active = false; };
  }, [currentRecipe]);

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <Header
        onBack={() => navigation.goBack()}
        title="Cooking Instructions"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Recipe Summary Bar */}
        <View style={styles.recipeHeaderCard}>
          <Text style={styles.recipeTitle}>{currentRecipe.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>{currentRecipe.cookingTime} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>{currentRecipe.servings} servings</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="restaurant-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>{currentRecipe.difficulty}</Text>
            </View>
          </View>
        </View>

        {/* Timeline Steps */}
        <View style={styles.timelineWrapper}>
          {instructions.map((stepItem, index) => {
            const isCompleted = !!completedSteps[stepItem.step];
            const isLast = index === instructions.length - 1;

            return (
              <TouchableOpacity
                key={stepItem.id}
                style={styles.stepRow}
                onPress={() => toggleStep(stepItem.step)}
                activeOpacity={0.8}
              >
                {/* Number circle & connecting line */}
                <View style={styles.indicatorCol}>
                  <View
                    style={[
                      styles.numberCircle,
                      isCompleted && styles.numberCircleCompleted,
                    ]}
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={14} color={colors.textWhite} />
                    ) : (
                      <Text style={styles.numberText}>{stepItem.step}</Text>
                    )}
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        styles.connectingLine,
                        isCompleted && styles.connectingLineCompleted,
                      ]}
                    />
                  )}
                </View>

                {/* Step Content */}
                <View
                  style={[
                    styles.stepCard,
                    isCompleted && styles.stepCardCompleted,
                  ]}
                >
                  <View style={styles.stepTitleRow}>
                    <Text
                      style={[
                        styles.stepTitle,
                        isCompleted && styles.stepTitleCompleted,
                      ]}
                    >
                      {stepItem.title}
                    </Text>
                    <Ionicons
                      name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                      size={18}
                      color={isCompleted ? colors.primary : '#CBD5E1'}
                    />
                  </View>

                  <Text
                    style={[
                      styles.stepDescription,
                      isCompleted && styles.stepDescriptionCompleted,
                    ]}
                  >
                    {stepItem.description}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
          {instructions.length === 0 && (
            <Text style={styles.recipeTitle}>Generating cooking instructions…</Text>
          )}
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <PrimaryButton
            title="View Shopping List"
            icon="cart"
            rightIcon="chevron-forward"
            onPress={() => navigation.navigate('ShoppingList', { recipeId: currentRecipe.id })}
            style={styles.ctaButton}
          />
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  recipeHeaderCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radiusLg,
    padding: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.soft,
  },
  recipeTitle: {
    ...typography.title2,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  timelineWrapper: {
    marginBottom: spacing.xl,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 32,
    marginRight: 10,
  },
  numberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EAF7E8',
    borderWidth: 2,
    borderColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberCircleCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  numberText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  connectingLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#D1E7DD',
    marginVertical: 4,
  },
  connectingLineCompleted: {
    backgroundColor: colors.primary,
  },
  stepCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radiusMd,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.soft,
  },
  stepCardCompleted: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stepTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stepTitleCompleted: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  stepDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  stepDescriptionCompleted: {
    color: colors.textMuted,
  },
  bottomActions: {
    marginTop: spacing.md,
  },
  ctaButton: {
    width: '100%',
  },
});
