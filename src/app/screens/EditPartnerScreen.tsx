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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import ScreenHeader from '../components/ui/ScreenHeader';
import GlassCard from '../components/ui/GlassCard';
import CosmicButton from '../components/ui/CosmicButton';
import CosmicInput from '../components/ui/CosmicInput';
import DateField from '../components/ui/DateField';
import LocationAutocomplete from '../components/ui/LocationAutocomplete';
import TimeDialPicker from '../components/astrology/TimeDialPicker';
import {
  useOnboardingStore,
  type BirthLocation,
  type Partner,
} from '../store/onboardingStore';
import { analytics, Events } from '../services/analyticsService';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { MainStackParamList } from '../navigation/routes';

export default function EditPartnerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const persisted = useOnboardingStore((s) => s.partner);
  const setPartner = useOnboardingStore((s) => s.setPartner);

  const [name, setName] = useState(persisted?.name ?? '');
  const [date, setDate] = useState(persisted?.birthDate ?? '1995-05-20');
  const [time, setTime] = useState<Partner['birthTime']>(
    persisted?.birthTime ?? { hour: 8, minute: 30, ampm: 'AM' },
  );
  const [locationText, setLocationText] = useState(persisted?.birthLocation.label ?? '');
  const [locationData, setLocationData] = useState<BirthLocation | null>(
    persisted?.birthLocation ?? null,
  );

  const canSave = name.trim().length > 0 && !!date && !!locationData;

  const onSave = () => {
    if (!canSave || !locationData) return;
    setPartner({
      name: name.trim(),
      birthDate: date,
      birthTime: time,
      birthLocation: locationData,
    });
    analytics.track(Events.PartnerAdded);
    navigation.goBack();
  };

  const onClear = () => {
    setPartner(null);
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
            title={persisted ? 'Edit Partner' : 'Add a Partner'}
            subtitle="Their birth details unlock the synastry"
            showBack
            onBack={() => navigation.goBack()}
          />
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <GlassCard>
              <CosmicInput
                label="Their Name"
                placeholder="e.g. Alex"
                icon="user"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </GlassCard>

            <GlassCard style={{ marginTop: spacing.md }}>
              <Text style={styles.section}>Date of Birth</Text>
              <DateField label="" value={date} onChange={setDate} />
            </GlassCard>

            <GlassCard style={{ marginTop: spacing.md }}>
              <Text style={styles.section}>Time of Birth</Text>
              <View style={styles.dialWrap}>
                <TimeDialPicker
                  hour={time.hour}
                  minute={time.minute}
                  ampm={time.ampm}
                  onChange={(h, m) => setTime((t) => ({ ...t, hour: h, minute: m }))}
                  onAmpmChange={(a) => setTime((t) => ({ ...t, ampm: a }))}
                />
              </View>
              <Text style={styles.helper}>If unknown, set 12:00 PM.</Text>
            </GlassCard>

            <GlassCard style={{ marginTop: spacing.md }}>
              <Text style={styles.section}>Birth Location</Text>
              <LocationAutocomplete
                value={locationText}
                onChangeText={(t) => {
                  setLocationText(t);
                  if (locationData && t !== locationData.label) setLocationData(null);
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
              title="Save Partner"
              onPress={onSave}
              disabled={!canSave}
              style={{ marginTop: spacing.lg }}
            />

            {persisted && (
              <CosmicButton
                title="Remove Partner"
                variant="outline"
                onPress={onClear}
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
