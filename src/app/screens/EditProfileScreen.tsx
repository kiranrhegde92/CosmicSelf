import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { updateProfile } from 'firebase/auth';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import GlassCard from '../components/ui/GlassCard';
import ScreenHeader from '../components/ui/ScreenHeader';
import CosmicInput from '../components/ui/CosmicInput';
import CosmicButton from '../components/ui/CosmicButton';
import { useAuthStore } from '../store/authStore';
import { getFirebaseAuth } from '../services/firebaseClient';
import { features } from '../config/env';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { MainStackParamList } from '../navigation/routes';

export default function EditProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);

  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!user) return;
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    setSaving(true);
    try {
      if (features.firebase) {
        const auth = getFirebaseAuth();
        if (auth?.currentUser) {
          await updateProfile(auth.currentUser, { displayName: trimmed });
        }
      }
      login({ ...user, name: trimmed });
      navigation.goBack();
    } catch {
      Alert.alert('Save failed', 'We couldn’t update your name. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <CosmicBackground intensity="low">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScreenHeader
            title="Edit Profile"
            subtitle="How the stars address you"
            showBack
            onBack={() => navigation.goBack()}
          />
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <GlassCard>
              <CosmicInput
                label="Display Name"
                placeholder="Your name"
                icon="user"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              <View style={styles.readOnlyRow}>
                <Text style={styles.readOnlyLabel}>Email</Text>
                <Text style={styles.readOnlyValue}>{user?.email || '—'}</Text>
              </View>
              <Text style={styles.helper}>
                Email is the credential we use to sign you in. To change it, contact support.
              </Text>
            </GlassCard>

            <CosmicButton
              title="Save Changes"
              onPress={onSave}
              loading={saving}
              style={{ marginTop: spacing.lg }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.screenH,
    paddingBottom: spacing.xl,
  },
  readOnlyRow: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
    marginTop: spacing.xs,
  },
  readOnlyLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  readOnlyValue: {
    ...typography.body,
    color: colors.white,
    marginTop: 4,
  },
  helper: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
