import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { scanService } from '../services/scanService';
import { foodImages } from '../data/mockData';
import { ScanningStep } from '../types';
import { useApp } from '../context/AppContext';
import { colors, spacing, typography, shadows } from '../theme';

type ScanningScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Scanning'>;
type ScanningScreenRouteProp = RouteProp<RootStackParamList, 'Scanning'>;

const INITIAL_STEPS: ScanningStep[] = [
  { id: 1, title: 'Image captured',        subtitle: 'Photo successfully uploaded',              status: 'completed' },
  { id: 2, title: 'Detecting ingredients',  subtitle: 'Finding food items in the image',          status: 'active' },
  { id: 3, title: 'Identifying food items', subtitle: 'Using AI vision to recognize ingredients', status: 'pending' },
  { id: 4, title: 'Organizing ingredients', subtitle: 'Preparing your results',                   status: 'pending' },
];

export const ScanningScreen: React.FC = () => {
  const navigation  = useNavigation<ScanningScreenNavigationProp>();
  const route       = useRoute<ScanningScreenRouteProp>();
  const { setDetectedIngredients } = useApp();

  // imageUri comes from HomeScreen after camera/gallery pick
  const imageUri = route.params?.imageUri;

  const [steps, setSteps] = useState<ScanningStep[]>(INITIAL_STEPS);

  // Scan line animation
  const [scanLineAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    // Loop the laser scan animation
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    );
    anim.start();

    // Kick off real or mock analysis
    const cancel = scanService.startScan(
      imageUri,
      (updatedSteps) => setSteps(updatedSteps),
      (ingredients) => {
        setDetectedIngredients(ingredients);
        navigation.replace('Ingredients');
      }
    );

    return () => {
      anim.stop();
      cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 220],
  });

  // Background: real captured photo if available, otherwise stock fridge image
  const backgroundSource = imageUri
    ? { uri: imageUri }
    : { uri: foodImages.fridgeInterior };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Full-screen background image (real photo or stock fridge) */}
      <Image source={backgroundSource} style={styles.backgroundImage} resizeMode="cover" />

      {/* Dark overlay with green tint */}
      <View style={styles.darkOverlay} />

      {/* Floating White Back Button */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Central Scanning Viewport with Reticle and Laser */}
      <View style={styles.scanningFrameContainer}>
        <View style={styles.scanningFrame}>
          {/* 4 Corner Markers */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* Animated Scanning Laser Line */}
          <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />

          {/* AI Tag */}
          <View style={styles.aiScanningTag}>
            <View style={styles.pulsingDot} />
            <Text style={styles.aiTagText}>AI Vision Active</Text>
          </View>
        </View>
      </View>

      {/* Bottom Analysis Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />

        <Text style={styles.sheetTitle}>Analyzing your fridge...</Text>
        <Text style={styles.sheetSubtitle}>
          Our AI is identifying ingredients in your image.
        </Text>

        {/* Status Timeline */}
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => {
            const isCompleted = step.status === 'completed';
            const isActive    = step.status === 'active';
            const isLast      = index === steps.length - 1;

            return (
              <View key={step.id} style={styles.stepRow}>
                {/* Left Indicator & Connecting Line */}
                <View style={styles.indicatorColumn}>
                  {isCompleted ? (
                    <View style={styles.checkCircle}>
                      <Ionicons name="checkmark" size={14} color={colors.textWhite} />
                    </View>
                  ) : isActive ? (
                    <View style={styles.activeCircle}>
                      <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                  ) : (
                    <View style={styles.pendingCircle} />
                  )}

                  {!isLast && (
                    <View
                      style={[
                        styles.connectingLine,
                        isCompleted && styles.connectingLineCompleted,
                      ]}
                    />
                  )}
                </View>

                {/* Right Text */}
                <View style={styles.stepTextContainer}>
                  <Text
                    style={[
                      styles.stepTitle,
                      isCompleted && styles.stepTitleCompleted,
                      isActive && styles.stepTitleActive,
                    ]}
                  >
                    {step.title}
                  </Text>
                  <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* "Did you know?" Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconWrapper}>
            <Ionicons name="bulb-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Did you know?</Text>
            <Text style={styles.infoText}>
              Our AI can recognize fruits, vegetables, dairy, meat, spices and more from just one photo.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 20, 12, 0.45)',
  },
  headerSafeArea: {
    position: 'absolute',
    top: 10,
    left: spacing.lg,
    zIndex: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  scanningFrameContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 260,
  },
  scanningFrame: {
    width: 260,
    height: 240,
    position: 'relative',
    borderRadius: 16,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#22C55E',
  },
  cornerTL: { top: 0, left: 0,  borderTopWidth: 3.5, borderLeftWidth: 3.5,  borderTopLeftRadius: 12 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3.5, borderRightWidth: 3.5, borderTopRightRadius: 12 },
  cornerBL: { bottom: 0, left: 0,  borderBottomWidth: 3.5, borderLeftWidth: 3.5,  borderBottomLeftRadius: 12 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3.5, borderRightWidth: 3.5, borderBottomRightRadius: 12 },
  scanLine: {
    width: '100%',
    height: 2.5,
    backgroundColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
  aiScanningTag: {
    position: 'absolute',
    bottom: -28,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: spacing.radiusPill,
    gap: 6,
  },
  pulsingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22C55E',
  },
  aiTagText: {
    color: colors.textWhite,
    fontSize: 11,
    fontWeight: '700',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: spacing.radiusSheet,
    borderTopRightRadius: spacing.radiusSheet,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    ...shadows.large,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    ...typography.title2,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sheetSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  stepsContainer: {
    marginBottom: spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 46,
  },
  indicatorColumn: {
    alignItems: 'center',
    width: 28,
    marginRight: 12,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E2E8F0',
    marginTop: 4,
  },
  connectingLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  connectingLineCompleted: {
    backgroundColor: colors.primary,
  },
  stepTextContainer: {
    flex: 1,
    paddingBottom: 10,
  },
  stepTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textMuted,
  },
  stepTitleActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  stepTitleCompleted: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  stepSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.secondary,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    alignItems: 'flex-start',
    gap: 10,
  },
  infoIconWrapper: {
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  infoText: {
    ...typography.caption,
    color: colors.textPrimary,
    lineHeight: 17,
  },
});
