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
import DateField from '../components/ui/DateField';
import LocationAutocomplete from '../components/ui/LocationAutocomplete';
import TimeDialPicker from '../components/astrology/TimeDialPicker';
import { useOnboardingStore, type BirthLocation } from '../store/onboardingStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { MainStackParamList } from '../navigation/routes';

export default function EditBirthDetailsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const persistedDate = useOnboardingStore((s) => s.birthDate);
  const persistedTime = useOnboardingStore((s) => s.birthTime);
  const persistedLocation = useOnboardingStore((s) => s.birthLocation);
  const setBirthDate = useOnboardingStore((s) => s.setBirthDate);
  const setBirthTime = useOnboardingStore((s) => s.setBirthTime);
  const setBirthLocation = useOnboardingStore((s) => s.setBirthLocation);

  const [date, setDate] = useState(persistedDate ?? '1995-05-20');
  const [time, setTime] = useState(persistedTime ?? { hour: 8, minute: 30, ampm: 'AM' as 'AM' | 'PM' });
  const [locationText, setLocationText] = useState(persistedLocation?.label ?? '');
  const [locationData, setLocationData] = useState<BirthLocation | null>(persistedLocation);

  const onSave = () => {
    setBirthDate(date);
    setBirthTime(time);
    if (locationData) setBirthLocation(locationData);
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
            title="Birth Details"
            subtitle="Refine your cosmic coordinates"
            showBack
            onBack={() => navigation.goBack()}
          />
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <GlassCard>
              <Text style={styles.section}>Date</Text>
              <DateField label="" value={date} onChange={setDate} />
            </GlassCard>

            <GlassCard style={{ marginTop: spacing.md }}>
              <Text style={styles.section}>Time</Text>
              <View style={styles.dialWrap}>
                <TimeDialPicker
                  hour={time.hour}
                  minute={time.minute}
                  ampm={time.ampm}
                  onChange={(h, m) => setTime((t) => ({ ...t, hour: h, minute: m }))}
                  onAmpmChange={(a) => setTime((t) => ({ ...t, ampm: a }))}
                />
              </View>
            </GlassCard>

            <GlassCard style={{ marginTop: spacing.md }}>
              <Text style={styles.section}>Location</Text>
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
              title="Save Changes"
              onPress={onSave}
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
  section: {
    ...typography.label,
    color: colors.goldPrimary,
    marginBottom: spacing.sm,
  },
  dialWrap: {
    alignItems: 'center',
  },
});
