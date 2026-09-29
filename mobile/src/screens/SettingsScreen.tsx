import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/common/Header';
import { useApp } from '../context/AppContext';
import {
  getApiBaseUrl,
  setApiBaseUrl,
  getDefaultApiBaseUrl,
  isBackendEnabled,
  setBackendEnabled,
  testBackendConnection,
} from '../config/api';
import { colors, spacing, typography, shadows } from '../theme';

interface ConnectionResultState {
  tested: boolean;
  ok?: boolean;
  message?: string;
  latency?: number;
  providerInfo?: string;
}

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { resetToHome, preferences, setVegetarianOnly } = useApp();

  // App & Diet Preferences
  const [metricUnits, setMetricUnits] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [vegetarian, setVegetarian] = useState(preferences.vegetarianOnly ?? false);

  // Backend & Networking State
  const [backendActive, setBackendActive] = useState(isBackendEnabled());
  const [apiUrlInput, setApiUrlInput] = useState(getApiBaseUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [connectionResult, setConnectionResult] = useState<ConnectionResultState>({
    tested: false,
  });

  const handleVegetarianToggle = (val: boolean) => {
    setVegetarian(val);
    setVegetarianOnly(val);
  };

  const handleBackendToggle = (val: boolean) => {
    setBackendActive(val);
    setBackendEnabled(val);
    setConnectionResult({ tested: false });
  };

  const handleApplyUrl = () => {
    const trimmed = apiUrlInput.trim().replace(/\/+$/, '');
    if (!trimmed) {
      Alert.alert('Invalid URL', 'Please enter a valid HTTP URL.');
      return;
    }
    setApiBaseUrl(trimmed);
    setApiUrlInput(trimmed);
    Alert.alert('Saved', `API Base URL updated to: ${trimmed}`);
  };

  const handleResetUrl = () => {
    const defaultUrl = getDefaultApiBaseUrl();
    setApiBaseUrl(defaultUrl);
    setApiUrlInput(defaultUrl);
    setConnectionResult({ tested: false });
    Alert.alert('Reset', `API Base URL reset to default: ${defaultUrl}`);
  };

  const handleTestConnection = async () => {
    const trimmed = apiUrlInput.trim().replace(/\/+$/, '');
    if (!trimmed) {
      Alert.alert('Invalid URL', 'Please enter an API URL before testing.');
      return;
    }
    setApiBaseUrl(trimmed);
    setIsTesting(true);
    setConnectionResult({ tested: false });

    try {
      const result = await testBackendConnection(trimmed);
      let providerStr = '';
      if (result.data?.providers) {
        const parts = Object.entries(result.data.providers)
          .filter(([, val]) => val.configured)
          .map(([name, val]) => `${name} (${val.keyCount} key${val.keyCount > 1 ? 's' : ''})`);
        providerStr = parts.length > 0 ? parts.join(', ') : 'Mock fallback only';
      }

      setConnectionResult({
        tested: true,
        ok: result.ok,
        latency: result.latencyMs,
        message: result.message,
        providerInfo: providerStr,
      });
    } catch (err) {
      setConnectionResult({
        tested: true,
        ok: false,
        message: err instanceof Error ? err.message : 'Unknown connection error',
      });
    } finally {
      setIsTesting(false);
    }
  };

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
            setVegetarian(false);
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
        keyboardShouldPersistTaps="handled"
      >
        {/* App Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.logoBadge}>
            <Ionicons name="leaf" size={24} color={colors.primary} />
          </View>
          <Text style={styles.appTitle}>FridgeAI</Text>
          <Text style={styles.appVersion}>Version 1.0.0 (Open Source Edition)</Text>
          <Text style={styles.appDescription}>
            Autonomous culinary vision system that transforms fridge photos into personalized,
            zero-waste recipes.
          </Text>
        </View>

        {/* Server & AI Pipeline Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="server-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionHeader}>Server & AI Pipeline</Text>
          </View>

          {/* Toggle Live Backend vs Mock */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingLabel}>Live AI Backend</Text>
              <Text style={styles.settingSubtext}>
                {backendActive
                  ? 'Active: Connects to Next.js API server'
                  : 'Offline: Uses bundled mock chef recipes'}
              </Text>
            </View>
            <Switch
              value={backendActive}
              onValueChange={handleBackendToggle}
              trackColor={{ false: '#CBD5E1', true: colors.primary }}
              thumbColor={colors.textWhite}
            />
          </View>

          {/* Backend Configuration Fields (Shown if Backend Enabled) */}
          {backendActive && (
            <View style={styles.backendConfigBlock}>
              <Text style={styles.inputLabel}>Backend API Base URL</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.urlInput}
                  value={apiUrlInput}
                  onChangeText={setApiUrlInput}
                  placeholder="http://localhost:3000"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
              </View>

              {/* Action Buttons Row */}
              <View style={styles.endpointButtonRow}>
                <TouchableOpacity
                  style={[styles.smallBtn, styles.testBtn]}
                  onPress={handleTestConnection}
                  disabled={isTesting}
                  activeOpacity={0.7}
                >
                  {isTesting ? (
                    <ActivityIndicator size="small" color={colors.textWhite} />
                  ) : (
                    <>
                      <Ionicons name="pulse-outline" size={16} color={colors.textWhite} />
                      <Text style={styles.smallBtnText}>Test Server</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.smallBtn, styles.saveBtn]}
                  onPress={handleApplyUrl}
                  activeOpacity={0.7}
                >
                  <Ionicons name="checkmark-outline" size={16} color={colors.primary} />
                  <Text style={styles.saveBtnText}>Save URL</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.smallBtn, styles.resetBtn]}
                  onPress={handleResetUrl}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.resetBtnText}>Default</Text>
                </TouchableOpacity>
              </View>

              {/* Connection Status Badge */}
              {connectionResult.tested && (
                <View
                  style={[
                    styles.statusBadge,
                    connectionResult.ok ? styles.statusBadgeSuccess : styles.statusBadgeError,
                  ]}
                >
                  <Ionicons
                    name={connectionResult.ok ? 'checkmark-circle' : 'alert-circle'}
                    size={20}
                    color={connectionResult.ok ? colors.primary : colors.danger}
                  />
                  <View style={styles.statusTextCol}>
                    <Text
                      style={[
                        styles.statusTitle,
                        { color: connectionResult.ok ? colors.primary : colors.danger },
                      ]}
                    >
                      {connectionResult.ok
                        ? `Connected (${connectionResult.latency}ms)`
                        : 'Connection Failed'}
                    </Text>
                    <Text style={styles.statusSubtext}>{connectionResult.message}</Text>
                    {connectionResult.ok && connectionResult.providerInfo ? (
                      <Text style={styles.providerBadge}>
                        Active Providers: {connectionResult.providerInfo}
                      </Text>
                    ) : null}
                  </View>
                </View>
              )}

              {/* IP Guidance Helper */}
              <View style={styles.networkTipsBox}>
                <Ionicons name="bulb-outline" size={16} color={colors.primary} />
                <View style={styles.networkTipsContent}>
                  <Text style={styles.networkTipsTitle}>Device Addressing Tips:</Text>
                  <Text style={styles.networkTipsText}>
                    • <Text style={styles.bold}>Android Emulator:</Text> use{' '}
                    <Text style={styles.codeText}>http://10.0.2.2:3000</Text>
                  </Text>
                  <Text style={styles.networkTipsText}>
                    • <Text style={styles.bold}>iOS Simulator:</Text> use{' '}
                    <Text style={styles.codeText}>http://localhost:3000</Text>
                  </Text>
                  <Text style={styles.networkTipsText}>
                    • <Text style={styles.bold}>Physical Phone:</Text> use your Mac LAN IP (e.g.{' '}
                    <Text style={styles.codeText}>http://192.168.1.X:3000</Text>)
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Preferences</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingLabel}>Vegetarian Only</Text>
              <Text style={styles.settingSubtext}>Strictly exclude poultry, meat, and seafood</Text>
            </View>
            <Switch
              value={vegetarian}
              onValueChange={handleVegetarianToggle}
              trackColor={{ false: '#CBD5E1', true: colors.primary }}
              thumbColor={colors.textWhite}
            />
          </View>

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
            onPress={() =>
              Alert.alert(
                'FridgeAI System Architecture',
                'Dual-engine culinary vision powered by Groq LLaMA-3.3-70B & Gemini 2.5 Flash, paired with zero-waste meal matching.'
              )
            }
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
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
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
    lineHeight: 16,
  },
  backendConfigBlock: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    marginBottom: spacing.sm,
  },
  urlInput: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  endpointButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 5,
  },
  testBtn: {
    backgroundColor: colors.primary,
    flex: 1.4,
  },
  saveBtn: {
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flex: 1,
  },
  resetBtn: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
  },
  smallBtnText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  saveBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  resetBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  statusBadgeSuccess: {
    backgroundColor: '#F2F9F5',
    borderColor: '#B7E4C7',
  },
  statusBadgeError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusTextCol: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  statusSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  providerBadge: {
    marginTop: 4,
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  networkTipsBox: {
    flexDirection: 'row',
    backgroundColor: colors.secondaryLight,
    borderRadius: 10,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  networkTipsContent: {
    flex: 1,
  },
  networkTipsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  networkTipsText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 2,
  },
  bold: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: colors.primary,
    fontWeight: '600',
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
