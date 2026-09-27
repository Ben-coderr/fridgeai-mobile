import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../context/AppContext';
import { pdfService } from '../services/pdfService';
import { colors, spacing, typography, shadows } from '../theme';

type PdfExportNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PdfExport'>;

const { width: SCREEN_W } = Dimensions.get('window');

// ─── What's included items ────────────────────────────────────────────────────
const INCLUDED = [
  { icon: 'grid-outline',         color: '#22C55E', bg: '#EAF7E8', label: 'Items you\nalready have' },
  { icon: 'cart-outline',         color: '#e67e22', bg: '#FFF1E5', label: 'Items to\npurchase' },
  { icon: 'restaurant-outline',   color: '#22C55E', bg: '#EAF7E8', label: 'Selected\nmeals (recipes)' },
  { icon: 'list-outline',         color: '#8B5CF6', bg: '#F3EEFF', label: 'Step-by-step\ninstructions' },
] as const;

// ─── PDF preview slides ───────────────────────────────────────────────────────
const SLIDES = [
  {
    key: '1',
    title: '1. Ingredients Overview',
    description: 'All fridge items + what to purchase',
  },
  {
    key: '2',
    title: '2. Selected Meals',
    description: 'Your AI-generated recipe choices',
  },
  {
    key: '3',
    title: '3. Recipes & Instructions',
    description: 'Full step-by-step cooking guide',
  },
  {
    key: '4',
    title: '4. Shopping Summary',
    description: 'Consolidated grocery list',
  },
  {
    key: '5',
    title: '5. Nutrition Tips',
    description: 'AI insights for healthy eating',
  },
];

export const PdfExportScreen: React.FC = () => {
  const navigation = useNavigation<PdfExportNavigationProp>();
  const { recipes, shoppingList, ingredients } = useApp();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<'download' | 'share' | null>(null);

  const slideScrollRef = useRef<ScrollView>(null);
  const [pulseAnim] = useState(() => new Animated.Value(1));

  // Pulse animation for the PDF icon
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  const goToSlide = (idx: number) => {
    const next = Math.max(0, Math.min(SLIDES.length - 1, idx));
    setCurrentSlide(next);
    slideScrollRef.current?.scrollTo({ x: next * (SCREEN_W - spacing.lg * 2), animated: true });
  };

  // ── Generate PDF ──────────────────────────────────────────────────────────
  const createPdf = async (): Promise<string | null> => {
    try {
      const result = await pdfService.generatePdf(recipes, shoppingList, ingredients);
      setPdfUri(result.uri);
      return result.uri;
    } catch {
      return null;
    }
  };

  // ── Download (save) ───────────────────────────────────────────────────────
  const handleDownload = async () => {
    setActionLoading('download');
    try {
      const uri = pdfUri || await createPdf();
      if (uri) await pdfService.savePdf(uri);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Share ─────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    setActionLoading('share');
    try {
      const uri = pdfUri || await createPdf();
      if (uri) await pdfService.sharePdf(uri);
    } finally {
      setActionLoading(null);
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <Animated.View style={[styles.pdfBadge, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.pdfBadgeText}>PDF</Text>
        </Animated.View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Title block ──────────────────────────────────────────────────── */}
        <Text style={styles.screenTitle}>Your Plan is Ready!</Text>
        <Text style={styles.screenSubtitle}>
          Export your full meal plan as a PDF to save, share or use while shopping and cooking.
        </Text>

        {/* ── What's included card ─────────────────────────────────────────── */}
        <View style={styles.includedCard}>
          <View style={styles.includedTitleRow}>
            <View style={styles.includedIconCircle}>
              <Ionicons name="document-text" size={18} color={colors.primary} />
            </View>
            <Text style={styles.includedTitle}>What&apos;s included in your PDF?</Text>
          </View>

          <View style={styles.includedGrid}>
            {INCLUDED.map((item) => (
              <View key={item.label} style={styles.includedItem}>
                <View style={[styles.includedItemIcon, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon as never} size={22} color={item.color} />
                </View>
                <Text style={styles.includedItemLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── PDF Preview carousel ─────────────────────────────────────────── */}
        <View style={styles.previewSection}>
          <View style={styles.previewHeader}>
            <View>
              <Text style={styles.previewTitle}>Preview of your PDF</Text>
              <Text style={styles.previewSubtitle}>
                Here&apos;s a sample of how your exported meal plan will look.
              </Text>
            </View>

            <View style={styles.paginator}>
              <TouchableOpacity
                style={[styles.pageBtn, currentSlide === 0 && styles.pageBtnDisabled]}
                onPress={() => goToSlide(currentSlide - 1)}
              >
                <Ionicons name="chevron-back" size={16} color={currentSlide === 0 ? '#CBD5E0' : colors.textPrimary} />
              </TouchableOpacity>

              <Text style={styles.pageCount}>
                {currentSlide + 1} / {SLIDES.length}
              </Text>

              <TouchableOpacity
                style={[styles.pageBtn, currentSlide === SLIDES.length - 1 && styles.pageBtnDisabled]}
                onPress={() => goToSlide(currentSlide + 1)}
              >
                <Ionicons name="chevron-forward" size={16} color={currentSlide === SLIDES.length - 1 ? '#CBD5E0' : colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Slide carousel */}
          <ScrollView
            ref={slideScrollRef}
            horizontal
            pagingEnabled={false}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            style={styles.slideScroll}
          >
            {SLIDES.map((slide, idx) => (
              <View key={slide.key} style={styles.slide}>
                {/* Stacked paper effect — back copies */}
                <View style={[styles.paperBack, { right: -10, bottom: -8 }]} />
                <View style={[styles.paperBack, { right: -5, bottom: -4 }]} />

                {/* Front page card */}
                <View style={styles.paperFront}>
                  {/* Branding header */}
                  <View style={styles.pdfBrandRow}>
                    <View style={styles.pdfBrandLeft}>
                      <View style={styles.pdfLogoCircle}>
                        <Ionicons name="leaf" size={14} color="#fff" />
                      </View>
                      <View>
                        <Text style={styles.pdfBrandName}>
                          <Text style={{ color: colors.primary }}>Fridge</Text>AI
                        </Text>
                        <Text style={styles.pdfBrandSub}>Personalized meals from your fridge</Text>
                      </View>
                    </View>
                    <View style={styles.pdfBrandRight}>
                      <Text style={styles.pdfReportLabel}>Meal Plan Report</Text>
                      <Text style={styles.pdfDate}>{today}</Text>
                    </View>
                  </View>

                  <View style={styles.pdfDivider} />

                  {/* Current slide content */}
                  <Text style={styles.pdfSlideNumber}>{idx + 1}. {slide.title}</Text>
                  <Text style={styles.pdfSlideDesc}>{slide.description}</Text>

                  {/* Ingredient overview mini-preview for slide 1 */}
                  {idx === 0 && (
                    <View style={styles.pdfPreviewContent}>
                      <View style={styles.pdfMiniRow}>
                        <View style={[styles.pdfMiniTag, { backgroundColor: '#EAF7E8' }]}>
                          <Ionicons name="checkmark-circle" size={10} color="#22C55E" />
                          <Text style={[styles.pdfMiniTagText, { color: '#22C55E' }]}>
                            Items you had ({ingredients.length})
                          </Text>
                        </View>
                        <View style={[styles.pdfMiniTag, { backgroundColor: '#FFF1E5' }]}>
                          <Ionicons name="cart" size={10} color="#e67e22" />
                          <Text style={[styles.pdfMiniTagText, { color: '#e67e22' }]}>
                            To purchase ({shoppingList.filter((i) => !i.isPurchased).length})
                          </Text>
                        </View>
                      </View>

                      {ingredients.slice(0, 4).map((ing) => (
                        <View key={ing.id} style={styles.pdfIngRow}>
                          <Image source={{ uri: ing.image }} style={styles.pdfIngThumb} />
                          <Text style={styles.pdfIngName}>{ing.name}</Text>
                          <Text style={styles.pdfIngQty}>{ing.quantity} {ing.unit}</Text>
                        </View>
                      ))}
                      {ingredients.length > 4 && (
                        <Text style={styles.pdfMoreText}>+ {ingredients.length - 4} more ingredients</Text>
                      )}
                    </View>
                  )}

                  {/* Recipes mini-preview for slide 2 */}
                  {idx === 1 && (
                    <View style={styles.pdfPreviewContent}>
                      <View style={styles.pdfRecipeGrid}>
                        {recipes.slice(0, 3).map((r) => (
                          <View key={r.id} style={styles.pdfRecipeCard}>
                            <Image source={{ uri: r.image }} style={styles.pdfRecipeThumb} />
                            <Text style={styles.pdfRecipeName} numberOfLines={2}>{r.title}</Text>
                            <Text style={styles.pdfRecipeMeta}>⏱ {r.cookingTime} min · 👤 {r.servings}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Instructions preview for slide 3 */}
                  {idx === 2 && (
                    <View style={styles.pdfPreviewContent}>
                      {recipes.slice(0, 1).map((r) => (
                        <View key={r.id}>
                          <View style={styles.pdfInstRow}>
                            <Image source={{ uri: r.image }} style={styles.pdfInstThumb} />
                            <View style={styles.pdfInstInfo}>
                              <Text style={styles.pdfInstTitle}>{r.title}</Text>
                              <View style={styles.pdfEasyBadge}>
                                <Text style={styles.pdfEasyText}>{r.difficulty}</Text>
                              </View>
                            </View>
                          </View>
                          {r.instructions.slice(0, 3).map((step) => (
                            <View key={step.id} style={styles.pdfStepRow}>
                              <View style={styles.pdfStepBullet}>
                                <Ionicons name="checkmark" size={8} color="#fff" />
                              </View>
                              <Text style={styles.pdfStepText} numberOfLines={2}>{step.description}</Text>
                            </View>
                          ))}
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Generic content for slides 4-5 */}
                  {idx >= 3 && (
                    <View style={styles.pdfPreviewContent}>
                      <View style={styles.pdfGenericPlaceholder}>
                        <Ionicons name="document-outline" size={28} color="#CBD5E0" />
                        <Text style={styles.pdfGenericText}>Content preview</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Dot indicators */}
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => goToSlide(i)}>
                <View style={[styles.dot, i === currentSlide && styles.dotActive]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Spacer before FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Bottom action bar ─────────────────────────────────────────────── */}
      <View style={styles.bottomBar}>
        <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.exportBtn}
              onPress={handleDownload}
              activeOpacity={0.88}
            disabled={actionLoading !== null}
            >
              <LinearGradient
                colors={['#16a34a', '#22C55E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.exportGradient}
              >
                {actionLoading === 'download' ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Ionicons name="download-outline" size={20} color="#fff" />
                )}
                <Text style={styles.exportBtnText}>Export as PDF</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShare}
              activeOpacity={0.88}
            disabled={actionLoading !== null}
            >
              {actionLoading === 'share' ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Ionicons name="share-outline" size={20} color={colors.primary} />
              )}
              <Text style={styles.shareBtnText}>Share</Text>
            </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_W = SCREEN_W - spacing.lg * 2;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: 16 },

  // ── Header ────────────────────────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  pdfBadge: {
    backgroundColor: '#e53e3e',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    ...shadows.medium,
  },
  pdfBadgeText: { fontSize: 15, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },

  // ── Title ─────────────────────────────────────────────────────────────────
  screenTitle: {
    ...typography.title1,
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  screenSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 20,
  },

  // ── Included card ─────────────────────────────────────────────────────────
  includedCard: {
    backgroundColor: '#EAF7E8',
    borderRadius: spacing.radiusCard,
    padding: spacing.md,
    marginBottom: 24,
  },
  includedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  includedIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  includedTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  includedGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  includedItem: { alignItems: 'center', width: 72 },
  includedItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  includedItemLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 13,
  },

  // ── Preview section ───────────────────────────────────────────────────────
  previewSection: { marginBottom: 8 },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  previewTitle: { ...typography.title3, color: colors.textPrimary, fontWeight: '700' },
  previewSubtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },

  paginator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pageBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtnDisabled: { opacity: 0.4 },
  pageCount: { fontSize: 12, fontWeight: '700', color: colors.textPrimary, minWidth: 32, textAlign: 'center' },

  slideScroll: { overflow: 'visible' },
  slide: {
    width: CARD_W,
    position: 'relative',
    paddingBottom: 12,
    marginRight: 12,
  },
  paperBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radiusCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  paperFront: {
    backgroundColor: '#fff',
    borderRadius: spacing.radiusCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 14,
    ...shadows.card,
  },

  // PDF mini-page internals
  pdfBrandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  pdfBrandLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pdfLogoCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfBrandName: { fontSize: 13, fontWeight: '800', color: colors.textPrimary },
  pdfBrandSub: { fontSize: 9, color: colors.textSecondary },
  pdfBrandRight: { alignItems: 'flex-end' },
  pdfReportLabel: { fontSize: 10, fontWeight: '700', color: colors.textPrimary },
  pdfDate: { fontSize: 9, color: colors.textSecondary },
  pdfDivider: { height: 1, backgroundColor: '#22C55E', marginBottom: 10, borderRadius: 1 },
  pdfSlideNumber: { fontSize: 12, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  pdfSlideDesc: { fontSize: 10, color: colors.textSecondary, marginBottom: 10 },

  pdfPreviewContent: { gap: 4 },
  pdfMiniRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  pdfMiniTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  pdfMiniTagText: { fontSize: 9, fontWeight: '700' },

  pdfIngRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  pdfIngThumb: { width: 18, height: 18, borderRadius: 4 },
  pdfIngName: { flex: 1, fontSize: 10, fontWeight: '600', color: '#333' },
  pdfIngQty: { fontSize: 9, color: '#888' },
  pdfMoreText: { fontSize: 9, color: colors.textMuted, marginTop: 2 },

  pdfRecipeGrid: { flexDirection: 'row', gap: 6 },
  pdfRecipeCard: { flex: 1, alignItems: 'center' },
  pdfRecipeThumb: { width: '100%', height: 50, borderRadius: 6, marginBottom: 3 },
  pdfRecipeName: { fontSize: 9, fontWeight: '700', color: '#333', textAlign: 'center' },
  pdfRecipeMeta: { fontSize: 8, color: '#888', textAlign: 'center', marginTop: 1 },

  pdfInstRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  pdfInstThumb: { width: 50, height: 40, borderRadius: 6 },
  pdfInstInfo: { flex: 1, justifyContent: 'center' },
  pdfInstTitle: { fontSize: 11, fontWeight: '700', color: '#333' },
  pdfEasyBadge: { backgroundColor: '#EAF7E8', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 3 },
  pdfEasyText: { fontSize: 9, fontWeight: '700', color: '#22C55E' },
  pdfStepRow: { flexDirection: 'row', gap: 5, alignItems: 'flex-start', paddingVertical: 2 },
  pdfStepBullet: { width: 13, height: 13, borderRadius: 6.5, backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  pdfStepText: { flex: 1, fontSize: 9, color: '#555', lineHeight: 12 },

  pdfGenericPlaceholder: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  pdfGenericText: { fontSize: 11, color: '#CBD5E0', fontWeight: '600' },

  // ── Dots ─────────────────────────────────────────────────────────────────
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E2E8F0' },
  dotActive: { backgroundColor: colors.primary, width: 18, borderRadius: 4 },

  // ── Bottom bar ────────────────────────────────────────────────────────────
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.large,
  },
  generateBtn: {
    height: 56,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadows.button,
  },
  generateBtnText: { ...typography.body, fontWeight: '700', color: '#fff', fontSize: 16 },

  actionsRow: { flexDirection: 'row', gap: 10 },
  exportBtn: { flex: 2, borderRadius: spacing.radiusPill, overflow: 'hidden', ...shadows.button },
  exportGradient: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  exportBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  shareBtn: {
    flex: 1,
    height: 56,
    borderRadius: spacing.radiusPill,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.cardBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  shareBtnText: { fontSize: 14, fontWeight: '700', color: colors.primary },
});
