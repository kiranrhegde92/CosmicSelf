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
import { useSocialAuth } from '../store/useSocialAuth';

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const login = useAuthStore((s) => s.login);
  const social = useSocialAuth({
    onSuccess: () => navigation.replace('BirthDetails'),
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [pwError, setPwError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    let valid = true;
    if (!email.trim()) {
      setEmailError('Please enter your email or phone');
      valid = false;
    } else setEmailError(undefined);
    if (!password) {
      setPwError('Please enter your password');
      valid = false;
    } else setPwError(undefined);
    if (!valid) return;

    setLoading(true);
    try {
      const user = await authService.login(email, password);
      login(user);
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
            <Text style={[typography.hero, styles.title]}>Welcome Back</Text>
            <Text style={[typography.subtitle, styles.subtitle]}>
              Continue your cosmic journey
            </Text>

            <GlassCard style={styles.card}>
              <CosmicInput
                placeholder="Email / Phone"
                icon="mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={emailError}
              />
              <CosmicInput
                placeholder="Password"
                icon="lock"
                value={password}
                onChangeText={setPassword}
                secureToggle
                secureTextEntry
                error={pwError}
              />

              <Pressable style={styles.forgot}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>

              <CosmicButton
                title="Login"
                onPress={onLogin}
                loading={loading}
                style={{ marginTop: spacing.sm }}
              />

              <View style={styles.dividerRow}>
                <View style={styles.divLine} />
                <Text style={styles.divText}>or continue with</Text>
                <View style={styles.divLine} />
              </View>

              <View style={styles.socialRow}>
                <View style={{ flex: 1 }}>
                  <CosmicButton
                    title="Google"
                    icon="google"
                    variant="glass"
                    loading={social.loading === 'google'}
                    disabled={!social.googleAvailable || social.loading !== null}
                    onPress={social.onGoogle}
                  />
                </View>
                {social.appleAvailable && (
                  <>
                    <View style={{ width: spacing.sm }} />
                    <View style={{ flex: 1 }}>
                      <CosmicButton
                        title="Apple"
                        icon="apple"
                        variant="glass"
                        loading={social.loading === 'apple'}
                        disabled={social.loading !== null}
                        onPress={social.onApple}
                      />
                    </View>
                  </>
                )}
              </View>

              {social.error && (
                <Text style={styles.socialError}>{social.error.message}</Text>
              )}
            </GlassCard>

            <View style={styles.footer}>
              <Text style={styles.footerText}>New here? </Text>
              <Pressable onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.footerLink}>Create account</Text>
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
    paddingTop: spacing.xl,
  },
  headerOrnament: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.goldBright,
    textAlign: 'center',
    letterSpacing: 0.6,
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.lg,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginBottom: spacing.sm,
  },
  forgotText: {
    ...typography.caption,
    color: colors.goldPrimary,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    gap: spacing.sm,
  },
  divLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(246,200,95,0.18)',
  },
  divText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  socialRow: {
    flexDirection: 'row',
  },
  socialError: {
    ...typography.caption,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.sm,
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
