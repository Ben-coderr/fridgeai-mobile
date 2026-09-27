import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../context/AppContext';
import { Header } from '../components/common/Header';
import { IngredientRow } from '../components/ingredients/IngredientRow';
import { QuantityStepper } from '../components/common/QuantityStepper';
import { MealTypeSelector } from '../components/preferences/MealTypeSelector';
import { PreferenceChips } from '../components/preferences/PreferenceButton';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { colors, spacing, typography, shadows } from '../theme';

type IngredientsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Ingredients'
>;

export const IngredientsScreen: React.FC = () => {
  const navigation = useNavigation<IngredientsScreenNavigationProp>();
  const {
    ingredients,
    updateIngredientQuantity,
    deleteIngredient,
    addIngredient,
    preferences,
    setPeopleCount,
    setMealType,
    setPreference,
  } = useApp();

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [newIngredientName, setNewIngredientName] = useState<string>('');
  const [newIngredientQty, setNewIngredientQty] = useState<string>('1');
  const [newIngredientUnit, setNewIngredientUnit] = useState<string>('pcs');

  const handleAddIngredient = () => {
    if (!newIngredientName.trim()) {
      Alert.alert('Please enter an ingredient name');
      return;
    }
    const qty = parseInt(newIngredientQty, 10) || 1;
    addIngredient(newIngredientName.trim(), qty, newIngredientUnit.trim() || 'pcs');
    setNewIngredientName('');
    setNewIngredientQty('1');
    setNewIngredientUnit('pcs');
    setModalVisible(false);
  };

  const handleGenerateRecipes = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      navigation.navigate('Recipes');
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header with back button and "Edit" action */}
      <Header
        onBack={() => navigation.navigate('Home')}
        rightText="Edit"
        onRightPress={() => {
          Alert.alert('Edit Mode', 'You can adjust quantities or remove ingredients below.');
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Badge Row */}
        <View style={styles.titleRow}>
          <View style={styles.titleTextContainer}>
            <Text style={styles.screenTitle}>Detected Ingredients</Text>
            <Text style={styles.screenSubtitle}>
              We found these ingredients in your fridge.{'\n'}You can add, remove or edit them.
            </Text>
          </View>

          <View style={styles.detectedBadge}>
            <Ionicons name="sparkles" size={13} color={colors.primary} />
            <Text style={styles.detectedBadgeText}>
              {ingredients.length} ingredients detected
            </Text>
          </View>
        </View>

        {/* Ingredient Cards List */}
        <View style={styles.listContainer}>
          {ingredients.map((item) => (
            <IngredientRow
              key={item.id}
              ingredient={item}
              onIncrement={() => updateIngredientQuantity(item.id, 1)}
              onDecrement={() => updateIngredientQuantity(item.id, -1)}
              onDelete={() => deleteIngredient(item.id)}
            />
          ))}

          {ingredients.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="basket-outline" size={40} color={colors.textMuted} />
              <Text style={styles.emptyText}>No ingredients detected yet.</Text>
            </View>
          )}

          {/* "+ Add Ingredient" Button */}
          <TouchableOpacity
            style={styles.addIngredientButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color={colors.primary} />
            <Text style={styles.addIngredientText}>Add Ingredient</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.sectionDivider} />

        {/* Meal Preferences Section */}
        <View style={styles.preferencesSection}>
          <Text style={styles.preferencesTitle}>Meal Preferences</Text>
          <Text style={styles.preferencesSubtitle}>
            Tell us a bit more so we can create the best recipes for you.
          </Text>

          {/* Number of People */}
          <View style={styles.peopleRow}>
            <Text style={styles.preferenceLabel}>Number of people</Text>
            <QuantityStepper
              value={preferences.peopleCount}
              onIncrement={() => setPeopleCount(preferences.peopleCount + 1)}
              onDecrement={() => setPeopleCount(preferences.peopleCount - 1)}
              size="medium"
              min={1}
              max={12}
            />
          </View>

          {/* Meal Type */}
          <View style={styles.preferenceGroup}>
            <Text style={styles.preferenceLabel}>Meal type</Text>
            <MealTypeSelector
              selected={preferences.mealType}
              onSelect={setMealType}
            />
          </View>

          {/* Preference Options */}
          <View style={styles.preferenceGroup}>
            <Text style={styles.preferenceLabel}>
              Preference <Text style={styles.optionalLabel}>(optional)</Text>
            </Text>
            <PreferenceChips
              selected={preferences.preference}
              onSelect={setPreference}
            />
          </View>

          {/* Generate Recipes CTA */}
          <PrimaryButton
            title="Generate Recipes"
            icon="sparkles"
            rightIcon="chevron-forward"
            onPress={handleGenerateRecipes}
            loading={isGenerating}
            style={styles.generateButton}
          />
        </View>
      </ScrollView>

      {/* Add Custom Ingredient Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Ingredient</Text>
            <Text style={styles.modalSubtitle}>
              Enter the ingredient name and estimated quantity.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Garlic, Pasta, Butter"
              placeholderTextColor={colors.textMuted}
              value={newIngredientName}
              onChangeText={setNewIngredientName}
              autoFocus
            />

            <View style={styles.modalRow}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Qty (e.g. 2)"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={newIngredientQty}
                onChangeText={setNewIngredientQty}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Unit (e.g. pcs, g)"
                placeholderTextColor={colors.textMuted}
                value={newIngredientUnit}
                onChangeText={setNewIngredientUnit}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleAddIngredient}
              >
                <Text style={styles.modalSaveText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  titleRow: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  titleTextContainer: {
    marginBottom: spacing.sm,
  },
  screenTitle: {
    ...typography.title1,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  screenSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  detectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EAF7E8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: spacing.radiusPill,
    alignSelf: 'flex-start',
  },
  detectedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  listContainer: {
    marginBottom: spacing.lg,
  },
  addIngredientButton: {
    height: 48,
    borderRadius: spacing.radiusMd,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    gap: 6,
  },
  addIngredientText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  preferencesSection: {
    paddingTop: spacing.xs,
  },
  preferencesTitle: {
    ...typography.title2,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  preferencesSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  peopleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    backgroundColor: colors.cardBackground,
    padding: spacing.md,
    borderRadius: spacing.radiusLg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.soft,
  },
  preferenceLabel: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  optionalLabel: {
    fontWeight: '400',
    color: colors.textMuted,
    fontSize: 12,
  },
  preferenceGroup: {
    marginBottom: spacing.lg,
  },
  generateButton: {
    marginTop: spacing.md,
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radiusCard,
    padding: spacing.xl,
    ...shadows.large,
  },
  modalTitle: {
    ...typography.title3,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  modalSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  input: {
    height: 46,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    marginBottom: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: '#FAFAF8',
  },
  modalRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: spacing.sm,
  },
  modalCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalSaveButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: spacing.radiusPill,
  },
  modalSaveText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textWhite,
  },
});
