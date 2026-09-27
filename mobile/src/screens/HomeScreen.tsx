import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../navigation/AppNavigator';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { foodImages } from '../data/mockData';
import { colors, spacing, typography, shadows } from '../theme';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleScan = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Access',
          'Camera permission is required to take a fridge photo. Enable it in your device settings, or use Upload a Photo.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        navigation.navigate('Scanning', {
          imageUri: result.assets[0].uri,
          base64: result.assets[0].base64 ?? undefined,
        });
      }
    } catch (error) {
      Alert.alert('Camera unavailable', error instanceof Error ? error.message : 'Unable to open the camera.');
    }
  };

  const handleUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Photo Library Access',
          'Photo library access is needed to select a fridge picture.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        navigation.navigate('Scanning', {
          imageUri: result.assets[0].uri,
          base64: result.assets[0].base64 ?? undefined,
        });
      }
    } catch (error) {
      Alert.alert('Photo library unavailable', error instanceof Error ? error.message : 'Unable to open your photos.');
    }
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Ionicons name="leaf" size={18} color={colors.primary} />
          </View>
          <Text style={styles.brandTitle}>FridgeAI</Text>
        </View>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleSettings}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Badge */}
        <View style={styles.badgeContainer}>
          <View style={styles.pillBadge}>
            <Ionicons name="sparkles" size={13} color={colors.primary} />
            <Text style={styles.pillBadgeText}>AI-Powered Meal Planner</Text>
          </View>
        </View>

        {/* Hero Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.heroTitleMain}>What&apos;s in</Text>
          <Text style={styles.heroTitleAccent}>your fridge?</Text>
          <Text style={styles.heroSubtitle}>
            Snap a photo and let AI figure out what you can cook.
          </Text>
        </View>

        {/* 3 Feature Indicators */}
        <View style={styles.featuresRow}>
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="camera" size={18} color={colors.primary} />
            </View>
            <Text style={styles.featureText}>Detect ingredients</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="restaurant" size={18} color={colors.primary} />
            </View>
            <Text style={styles.featureText}>Get recipes</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="cart" size={18} color={colors.primary} />
            </View>
            <Text style={styles.featureText}>Create shopping list</Text>
          </View>
        </View>

        {/* Hero Image Showcase Card */}
        <View style={styles.heroImageWrapper}>
          <Image
            source={{ uri: foodImages.fridgeInterior }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlayBadge}>
            <Ionicons name="scan" size={15} color={colors.textWhite} />
            <Text style={styles.overlayBadgeText}>AI Vision Ready</Text>
          </View>
        </View>

        {/* Actions Area */}
        <View style={styles.actionsContainer}>
          <PrimaryButton
            title="Scan My Fridge"
            icon="camera"
            rightIcon="chevron-forward"
            onPress={handleScan}
            style={styles.scanButton}
          />

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleUpload}
            activeOpacity={0.8}
          >
            <Ionicons name="image-outline" size={18} color={colors.primary} />
            <Text style={styles.uploadButtonText}>Upload a Photo</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  settingsButton: {
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
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  badgeContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: spacing.radiusPill,
    alignSelf: 'flex-start',
  },
  pillBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  titleContainer: {
    marginBottom: spacing.lg,
  },
  heroTitleMain: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  heroTitleAccent: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.primary,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    gap: 8,
  },
  featureItem: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: spacing.radiusMd,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.soft,
  },
  featureIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  heroImageWrapper: {
    height: 220,
    width: '100%',
    borderRadius: spacing.radiusCard,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(13, 82, 51, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: spacing.radiusPill,
  },
  overlayBadgeText: {
    color: colors.textWhite,
    fontSize: 11,
    fontWeight: '700',
  },
  actionsContainer: {
    gap: 12,
  },
  scanButton: {
    width: '100%',
  },
  uploadButton: {
    height: 52,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadButtonText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
});
