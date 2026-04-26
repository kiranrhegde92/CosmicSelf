import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import ScreenHeader from '../components/ui/ScreenHeader';
import GlassCard from '../components/ui/GlassCard';
import CosmicButton from '../components/ui/CosmicButton';
import CosmicInput from '../components/ui/CosmicInput';
import DateField from '../components/ui/DateField';
import LocationAutocomplete from '../components/ui/LocationAutocomplete';
import TimeDialPicker from '../components/astrology/TimeDialPicker';
import {
  newPartnerId,
  useOnboardingStore,
  type BirthLocation,
  type Partner,
} from '../store/onboardingStore';
import { analytics, Events } from '../services/analyticsService';
import { partnerRepository } from '../services/partnerRepository';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { MainStackParamList } from '../navigation/routes';

export default function EditPartnerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { t } = useTranslation();
  const route = useRoute<RouteProp<MainStackParamList, 'EditPartner'>>();
  const editingId = route.params?.id;

  const existing = useOnboardingStore((s) =>
    editingId ? s.partners.find((p) => p.id === editingId) ?? null : null,
  );
  const addPartner = useOnboardingStore((s) => s.addPartner);
  const updatePartner = useOnboardingStore((s) => s.updatePartner);
  const removePartner = useOnboardingStore((s) => s.removePartner);
  const setActivePartnerId = useOnboardingStore((s) => s.setActivePartnerId);

  const [name, setName] = useState(existing?.name ?? '');
  const [date, setDate] = useState(existing?.birthDate ?? '1995-05-20');
  const [time, setTime] = useState<Partner['birthTime']>(
    existing?.birthTime ?? { hour: 8, minute: 30, ampm: 'AM' },
  );
  const [locationText, setLocationText] = useState(
    existing?.birthLocation.label ?? '',
  );
  const [locationData, setLocationData] = useState<BirthLocation | null>(
    existing?.birthLocation ?? null,
  );

  const canSave = name.trim().length > 0 && !!date && !!locationData;

  const onSave = () => {
    if (!canSave || !locationData) return;
    if (existing) {
      const patch = {
        name: name.trim(),
        birthDate: date,
        birthTime: time,
        birthLocation: locationData,
      };
      updatePartner(existing.id, patch);
      partnerRepository.save({ ...existing, ...patch });
      analytics.track(Events.PartnerAdded);
    } else {
      const next: Partner = {
        id: newPartnerId(),
        name: name.trim(),
        birthDate: date,
        birthTime: time,
        birthLocation: locationData,
      };
      addPartner(next);
      // Make a brand-new partner the active one — the most common intent.
      setActivePartnerId(next.id);
      partnerRepository.save(next);
      analytics.track(Events.PartnerAdded);
    }
    navigation.goBack();
  };

  const onRemove = () => {
    if (!existing) return;
    removePartner(existing.id);
    partnerRepository.remove(existing.id);
    navigation.goBack();
  };

  return (
    <CosmicBackground intensity="low">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScreenHeader
            title={existing ? t('editPartner.titleEdit') : t('editPartner.titleAdd')}
            subtitle={t('editPartner.subtitle')}
            showBack
            onBack={() => navigation.goBack()}
          />
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <GlassCard>
              <CosmicInput
                label={t('editPartner.name')}
                placeholder={t('editPartner.namePlaceholder')}
                icon="user"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </GlassCard>

            <GlassCard style={{ marginTop: spacing.md }}>
              <Text style={styles.section}>{t('editPartner.dob')}</Text>
              <DateField label="" value={date} onChange={setDate} />
            </GlassCard>

            <GlassCard style={{ marginTop: spacing.md }}>
              <Text style={styles.section}>{t('editPartner.tob')}</Text>
              <View style={styles.dialWrap}>
                <TimeDialPicker
                  hour={time.hour}
                  minute={time.minute}
                  ampm={time.ampm}
                  onChange={(h, m) => setTime((prev) => ({ ...prev, hour: h, minute: m }))}
                  onAmpmChange={(a) => setTime((prev) => ({ ...prev, ampm: a }))}
                />
              </View>
              <Text style={styles.helper}>{t('editPartner.tobHelper')}</Text>
            </GlassCard>

            <GlassCard style={{ marginTop: spacing.md }}>
              <Text style={styles.section}>{t('editPartner.location')}</Text>
              <LocationAutocomplete
                value={locationText}
                onChangeText={(text) => {
                  setLocationText(text);
                  if (locationData && text !== locationData.label) setLocationData(null);
                }}
                onSelect={(p) => {
                  const label = [p.name, p.admin1, p.country].filter(Boolean).join(', ');
                  setLocationText(label);
                  setLocationData({
                    label,
                    lat: p.lat,
                    lon: p.lon,
                    timezone: p.timezone,
                    tzOffsetMinutes: p.tzOffsetMinutes ?? 0,
                  });
                }}
              />
            </GlassCard>

            <CosmicButton
              title={t('editPartner.save')}
              onPress={onSave}
              disabled={!canSave}
              style={{ marginTop: spacing.lg }}
            />

            {existing && (
              <CosmicButton
                title={t('editPartner.remove')}
                variant="outline"
                onPress={onRemove}
                style={{ marginTop: spacing.sm }}
              />
            )}
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
  section: {
    ...typography.label,
    color: colors.goldPrimary,
    marginBottom: spacing.sm,
  },
  helper: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  dialWrap: {
    alignItems: 'center',
  },
});
