import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { updateProfile } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import GlassCard from '../components/ui/GlassCard';
import ScreenHeader from '../components/ui/ScreenHeader';
import CosmicInput from '../components/ui/CosmicInput';
import CosmicButton from '../components/ui/CosmicButton';
import CosmicIcon from '../components/ui/CosmicIcon';
import { useAuthStore } from '../store/authStore';
import { getFirebaseAuth } from '../services/firebaseClient';
import { removeAvatar, uploadAvatar } from '../services/avatarService';
import { features } from '../config/env';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { MainStackParamList } from '../navigation/routes';

export default function EditProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);

  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>();

  const onSave = async () => {
    if (!user) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError(t('editProfile.errors.emptyName'));
      return;
    }
    setNameError(undefined);
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
      Alert.alert(
        t('editProfile.errors.saveFailedTitle'),
        t('editProfile.errors.saveFailedBody'),
      );
    } finally {
      setSaving(false);
    }
  };

  const pickAndUpload = async () => {
    if (!user) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        t('editProfile.avatar.permissionTitle'),
        t('editProfile.avatar.permissionBody'),
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const localUri = result.assets[0].uri;

    setUploadingAvatar(true);
    try {
      const url = await uploadAvatar(localUri);
      login({ ...user, photoURL: url });
    } catch {
      Alert.alert(
        t('editProfile.avatar.uploadFailedTitle'),
        t('editProfile.avatar.uploadFailedBody'),
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onAvatarPress = () => {
    if (!user) return;
    const buttons: Array<{
      text: string;
      style?: 'cancel' | 'destructive' | 'default';
      onPress?: () => void;
    }> = [
      { text: t('editProfile.avatar.pick'), onPress: () => void pickAndUpload() },
    ];
    if (user.photoURL) {
      buttons.push({
        text: t('editProfile.avatar.remove'),
        style: 'destructive',
        onPress: async () => {
          setUploadingAvatar(true);
          try {
            await removeAvatar();
            login({ ...user, photoURL: null });
          } catch {
            /* ignore */
          } finally {
            setUploadingAvatar(false);
          }
        },
      });
    }
    buttons.push({ text: t('common.cancel'), style: 'cancel' });
    Alert.alert(t('editProfile.avatar.actionsTitle'), undefined, buttons);
  };

  return (
    <CosmicBackground intensity="low">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScreenHeader
            title={t('editProfile.title')}
            subtitle={t('editProfile.subtitle')}
            showBack
            onBack={() => navigation.goBack()}
          />
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.avatarBlock}>
              <Pressable
                onPress={onAvatarPress}
                disabled={uploadingAvatar}
                accessibilityLabel={t('editProfile.avatar.edit')}
                accessibilityRole="button"
                style={styles.avatarFrame}
              >
                {user?.photoURL ? (
                  <Image source={{ uri: user.photoURL }} style={styles.avatarImg} />
                ) : (
                  <View style={[styles.avatarImg, styles.avatarFallback]}>
                    <CosmicIcon name="user" color={colors.goldPrimary} size={44} />
                  </View>
                )}
                <View style={styles.editBadge}>
                  {uploadingAvatar ? (
                    <ActivityIndicator size="small" color="#1A0F33" />
                  ) : (
                    <CosmicIcon name="plus" color="#1A0F33" size={16} strokeWidth={2.5} />
                  )}
                </View>
              </Pressable>
              <Text style={styles.avatarHelper}>
                {uploadingAvatar
                  ? t('editProfile.avatar.uploading')
                  : t('editProfile.avatar.edit')}
              </Text>
            </View>

            <GlassCard>
              <CosmicInput
                label={t('editProfile.displayName')}
                placeholder={t('editProfile.displayNamePlaceholder')}
                icon="user"
                value={name}
                onChangeText={(value) => {
                  setName(value);
                  if (nameError) setNameError(undefined);
                }}
                autoCapitalize="words"
                error={nameError}
              />
              <View style={styles.readOnlyRow}>
                <Text style={styles.readOnlyLabel}>{t('editProfile.emailLabel')}</Text>
                <Text style={styles.readOnlyValue}>{user?.email || '—'}</Text>
              </View>
              <Text style={styles.helper}>{t('editProfile.emailHelper')}</Text>
            </GlassCard>

            <CosmicButton
              title={t('editProfile.save')}
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

const AVATAR_SIZE = 128;

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.screenH,
    paddingBottom: spacing.xl,
  },
  avatarBlock: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  avatarFrame: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.goldPrimary,
    overflow: 'visible',
    shadowColor: colors.goldPrimary,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  avatarImg: {
    width: AVATAR_SIZE - 4,
    height: AVATAR_SIZE - 4,
    borderRadius: (AVATAR_SIZE - 4) / 2,
  },
  avatarFallback: {
    backgroundColor: 'rgba(20,18,41,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.goldPrimary,
    borderWidth: 2,
    borderColor: '#1A0F33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHelper: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
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
