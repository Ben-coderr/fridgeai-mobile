import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/common/Header';
import { useApp } from '../context/AppContext';
import { colors, spacing, typography, shadows } from '../theme';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { resetToHome } = useApp();

  const [notifications, setNotifications] = useState(true);
  const [metricUnits, setMetricUnits] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);
  const [vegetarian, setVegetarian] = useState(false);

  const handleReset = () => {
    Alert.alert(
      'Reset Demo State',
      'This will restore all default ingredients, preferences, and recipes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetToHome();
            Alert.alert('Reset Complete', 'App state has been reset to defaults.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <Header onBack={() => navigation.goBack()} title="Settings" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.logoBadge}>
            <Ionicons name="leaf" size={24} color={colors.primary} />
          </View>
          <Text style={styles.appTitle}>FridgeAI</Text>
          <Text style={styles.appVersion}>Version 1.0.0 (MVP Demo)</Text>
          <Text style={styles.appDescription}>
            AI-powered meal planner that transforms your fridge photos into delicious, actionable recipes.
          </Text>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Preferences</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingLabel}>Use Metric Units</Text>
              <Text style={styles.settingSubtext}>Grams, milliliters, and pieces</Text>
            </View>
            <Switch
              value={metricUnits}
              onValueChange={setMetricUnits}
              trackColor={{ false: '#CBD5E1', true: colors.primary }}
              thumbColor={colors.textWhite}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingLabel}>Vegetarian Only</Text>
              <Text style={styles.settingSubtext}>Filter out poultry, meat, and seafood</Text>
            </View>
            <Switch
              value={vegetarian}
              onValueChange={setVegetarian}
              trackColor={{ false: '#CBD5E1', true: colors.primary }}
              thumbColor={colors.textWhite}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingLabel}>Recipe Notifications</Text>
              <Text style={styles.settingSubtext}>Daily meal suggestions based on ingredients</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#CBD5E1', true: colors.primary }}
              thumbColor={colors.textWhite}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingLabel}>Save Scan History</Text>
              <Text style={styles.settingSubtext}>Keep track of previously scanned fridges</Text>
            </View>
            <Switch
              value={saveHistory}
              onValueChange={setSaveHistory}
              trackColor={{ false: '#CBD5E1', true: colors.primary }}
              thumbColor={colors.textWhite}
            />
          </View>
        </View>

        {/* Data & Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Actions</Text>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.actionLabel}>Reset Demo Session Data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => Alert.alert('FridgeAI', 'Designed for modern, seamless meal discovery.')}
            activeOpacity={0.7}
          >
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.actionLabel}>About FridgeAI Vision System</Text>
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  infoCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radiusCard,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  appTitle: {
    ...typography.title2,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  appVersion: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  appDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  section: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radiusCard,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  sectionHeader: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  settingSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
