import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import GlassCard from '../components/ui/GlassCard';
import CosmicInput from '../components/ui/CosmicInput';
import CosmicButton from '../components/ui/CosmicButton';
import CosmicIcon from '../components/ui/CosmicIcon';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { AuthStackParamList } from '../navigation/routes';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

type Field = 'name' | 'email' | 'password' | 'confirm';

export default function SignupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const signup = useAuthStore((s) => s.signup);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next: Partial<Record<Field, string>> = {};
    if (!name.trim()) next.name = 'Please enter your name';
    if (!email.trim()) next.email = 'Please enter your email or phone';
    if (password.length < 6) next.password = 'Password must be at least 6 characters';
    if (confirm !== password) next.confirm = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    if (!agree) return;
    setLoading(true);
    try {
      const user = await authService.signup(name, email, password);
      signup(user);
      navigation.replace('BirthDetails');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CosmicBackground intensity="medium">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerOrnament}>
              <CosmicIcon name="sparkle" color={colors.goldPrimary} size={20} />
            </View>
            <Text style={[typography.hero, styles.title]}>Begin Your Journey</Text>
            <Text style={[typography.subtitle, styles.subtitle]}>
              The stars are waiting for you
            </Text>

            <GlassCard style={styles.card}>
              <CosmicInput
                placeholder="Full Name"
                icon="user"
                value={name}
                onChangeText={setName}
                error={errors.name}
              />
              <CosmicInput
                placeholder="Email / Phone"
                icon="mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />
              <CosmicInput
                placeholder="Password"
                icon="lock"
                value={password}
                onChangeText={setPassword}
                secureToggle
                secureTextEntry
                error={errors.password}
              />
              <CosmicInput
                placeholder="Confirm Password"
                icon="lock"
                value={confirm}
                onChangeText={setConfirm}
                secureToggle
                secureTextEntry
                error={errors.confirm}
              />

              <Pressable style={styles.agreeRow} onPress={() => setAgree(!agree)}>
                <View style={[styles.box, agree && styles.boxOn]}>
                  {agree && <CosmicIcon name="check" color={colors.bgPrimary} size={12} strokeWidth={3} />}
                </View>
                <Text style={styles.agreeText}>
                  I agree to the <Text style={{ color: colors.goldPrimary }}>Terms of Service</Text> and{' '}
                  <Text style={{ color: colors.goldPrimary }}>Privacy Policy</Text>
                </Text>
              </Pressable>

              <CosmicButton
                title="Create Account"
                onPress={onSubmit}
                loading={loading}
                disabled={!agree}
                style={{ marginTop: spacing.sm }}
              />

              <Text style={styles.privacy}>Your data is secure and never shared.</Text>
            </GlassCard>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Pressable onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerLink}>Login</Text>
              </Pressable>
            </View>
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
    paddingTop: spacing.lg,
  },
  headerOrnament: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.goldBright,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.lg,
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
    gap: spacing.sm,
  },
  box: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.4,
    borderColor: colors.goldPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: {
    backgroundColor: colors.goldPrimary,
  },
  agreeText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  privacy: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footerLink: {
    ...typography.body,
    color: colors.goldBright,
    fontWeight: '600',
  },
});
