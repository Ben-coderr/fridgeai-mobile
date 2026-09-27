import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Modal,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../context/AppContext';
import { Header } from '../components/common/Header';
import { ShoppingItemRow } from '../components/shopping/ShoppingItemRow';
import { Badge } from '../components/common/Badge';
import { foodImages } from '../data/mockData';
import { colors, spacing, typography, shadows } from '../theme';

type ShoppingListRouteProp = RouteProp<RootStackParamList, 'ShoppingList'>;
type ShoppingListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ShoppingList'
>;

export const ShoppingListScreen: React.FC = () => {
  const navigation = useNavigation<ShoppingListNavigationProp>();
  const route = useRoute<ShoppingListRouteProp>();
  const {
    selectedRecipe,
    recipes,
    shoppingList,
    toggleShoppingItem,
    updateShoppingQuantity,
    addShoppingItem,
    markAllAsPurchased,
    resetToHome,
  } = useApp();

  const recipeId = route.params?.recipeId;
  const currentRecipe = recipes.find((r) => r.id === recipeId) || selectedRecipe;

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemQty, setNewItemQty] = useState<string>('1');
  const [newItemUnit, setNewItemUnit] = useState<string>('pcs');

  const handleShare = async () => {
    try {
      const itemsText = shoppingList
        .map((item) => `- ${item.name} (${item.quantity} ${item.unit}) [${item.isPurchased ? 'x' : ' '}]`)
        .join('\n');

      const message = `🛒 FridgeAI Shopping List for ${currentRecipe.title}:\n\n${itemsText}\n\nHave a great meal!`;
      await Share.share({ message });
    } catch {
      Alert.alert('Shopping List Shared', 'Your list is ready to share!');
    }
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      Alert.alert('Please enter an item name');
      return;
    }
    const qty = parseInt(newItemQty, 10) || 1;
    addShoppingItem(newItemName.trim(), qty, newItemUnit.trim() || 'pcs');
    setNewItemName('');
    setNewItemQty('1');
    setNewItemUnit('pcs');
    setModalVisible(false);
  };

  const handleStartOver = () => {
    resetToHome();
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <Header onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Header with Grocery Bag Illustration */}
        <View style={styles.topHeaderRow}>
          <View style={styles.titleColumn}>
            <Text style={styles.screenTitle}>Shopping List</Text>
            <Text style={styles.screenSubtitle}>
              Here are the ingredients you need to buy for your selected recipe.
            </Text>
          </View>

          {/* Grocery Bag Illustration */}
          <View style={styles.bagImageContainer}>
            <Image
              source={{ uri: foodImages.groceryBag }}
              style={styles.bagImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Selected Recipe Summary Card */}
        <View style={styles.selectedRecipeCard}>
          <Image
            source={{ uri: currentRecipe.image }}
            style={styles.recipeThumbnail}
            resizeMode="cover"
          />

          <View style={styles.recipeCardContent}>
            <Badge
              label="Selected Recipe"
              variant="tag"
              style={styles.selectedTag}
            />

            <Text style={styles.recipeTitle} numberOfLines={1}>
              {currentRecipe.title}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.metaText}>{currentRecipe.cookingTime} min</Text>
              </View>

              <View style={styles.metaItem}>
                <Ionicons name="person-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.metaText}>{currentRecipe.servings} servings</Text>
              </View>

              <View style={styles.metaItem}>
                <Ionicons name="restaurant-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.metaText}>{currentRecipe.difficulty}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 1: Items to Buy */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.cartIconWrapper}>
              <Ionicons name="cart" size={18} color="#FF7518" />
            </View>
            <View>
              <Text style={styles.sectionHeading}>Items to Buy</Text>
              <Text style={styles.sectionSubtext}>
                {shoppingList.length} {shoppingList.length === 1 ? 'ingredient' : 'ingredients'} needed
              </Text>
            </View>
          </View>

          {/* List of items */}
          <View style={styles.itemsList}>
            {shoppingList.map((item) => (
              <ShoppingItemRow
                key={item.id}
                item={item}
                onToggle={() => toggleShoppingItem(item.id)}
                onIncrement={() => updateShoppingQuantity(item.id, 1)}
                onDecrement={() => updateShoppingQuantity(item.id, -1)}
              />
            ))}

            {shoppingList.length === 0 && (
              <Text style={styles.emptyItemsText}>All items purchased or list is empty!</Text>
            )}
          </View>
        </View>

        {/* Section 2: You Already Have */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.checkIconWrapper}>
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
            </View>
            <View>
              <Text style={styles.sectionHeading}>You Already Have</Text>
              <Text style={styles.sectionSubtext}>
                {currentRecipe.availableIngredients.length} ingredients from your fridge
              </Text>
            </View>
          </View>

          <View style={styles.haveItemsList}>
            {currentRecipe.availableIngredients.map((item) => (
              <View key={item.id} style={styles.haveRow}>
                <View style={styles.haveThumbWrapper}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.haveThumb}
                    resizeMode="cover"
                  />
                </View>

                <Text style={styles.haveName} numberOfLines={1}>
                  {item.name}
                </Text>

                <Text style={styles.haveQty}>
                  {item.quantity} {item.unit}
                </Text>

                <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionsRow}>
          {/* Share List */}
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Ionicons name="share-outline" size={18} color={colors.textPrimary} />
            <Text style={styles.shareText}>Share List</Text>
          </TouchableOpacity>

          {/* Mark as Purchased */}
          <TouchableOpacity
            style={styles.purchaseButton}
            onPress={markAllAsPurchased}
            activeOpacity={0.8}
          >
            <Ionicons name="cart" size={18} color={colors.textWhite} />
            <Text style={styles.purchaseText}>Mark as Purchased</Text>
          </TouchableOpacity>
        </View>

        {/* Tip Card */}
        <View style={styles.tipCard}>
          <View style={styles.tipIconWrapper}>
            <Ionicons name="bulb-outline" size={18} color={colors.primary} />
          </View>

          <View style={styles.tipTextContent}>
            <Text style={styles.tipHeading}>Tip</Text>
            <Text style={styles.tipBody}>
              You can also add other items you need from the store.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addItemAction}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={15} color={colors.primary} />
            <Text style={styles.addItemText}>Add Item</Text>
          </TouchableOpacity>
        </View>

        {/* Start Over Button */}
        <TouchableOpacity
          style={styles.startOverButton}
          onPress={handleStartOver}
          activeOpacity={0.7}
        >
          <Ionicons name="home-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.startOverText}>Start Over / Home</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Custom Shopping Item Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Shopping Item</Text>
            <Text style={styles.modalSubtitle}>
              Add any extra groceries you need to pick up.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Olive oil, Black pepper"
              placeholderTextColor={colors.textMuted}
              value={newItemName}
              onChangeText={setNewItemName}
              autoFocus
            />

            <View style={styles.modalRow}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Quantity (e.g. 1)"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={newItemQty}
                onChangeText={setNewItemQty}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Unit (e.g. bottle, pack)"
                placeholderTextColor={colors.textMuted}
                value={newItemUnit}
                onChangeText={setNewItemUnit}
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
                onPress={handleAddItem}
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
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  titleColumn: {
    flex: 1,
    paddingRight: 10,
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
  bagImageContainer: {
    width: 82,
    height: 82,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bagImage: {
    width: '100%',
    height: '100%',
  },
  selectedRecipeCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radiusCard,
    padding: 12,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  recipeThumbnail: {
    width: 80,
    height: 80,
    borderRadius: spacing.radiusMd,
    marginRight: 12,
  },
  recipeCardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  selectedTag: {
    marginBottom: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  recipeTitle: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
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
  sectionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radiusCard,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing.sm,
  },
  cartIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF1E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAF7E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  itemsList: {
    marginTop: 4,
  },
  emptyItemsText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 12,
  },
  haveItemsList: {
    marginTop: 4,
  },
  haveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  haveThumbWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    marginRight: 10,
  },
  haveThumb: {
    width: '100%',
    height: '100%',
  },
  haveName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  haveQty: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.lg,
  },
  shareButton: {
    flex: 1,
    height: 52,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.cardBackground,
    borderWidth: 1.5,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  shareText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  purchaseButton: {
    flex: 1.3,
    height: 52,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...shadows.button,
  },
  purchaseText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textWhite,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#EAF7E8',
    borderRadius: spacing.radiusLg,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: 10,
  },
  tipIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTextContent: {
    flex: 1,
  },
  tipHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 1,
  },
  tipBody: {
    fontSize: 11,
    color: colors.textPrimary,
    lineHeight: 15,
  },
  addItemAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: spacing.radiusPill,
  },
  addItemText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  startOverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: 6,
  },
  startOverText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
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
