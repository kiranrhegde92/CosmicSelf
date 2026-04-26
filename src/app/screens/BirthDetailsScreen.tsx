import React, { useMemo, useState } from 'react';
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
import Animated, {
  FadeInDown,
  FadeOutUp,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import ScreenHeader from '../components/ui/ScreenHeader';
import GlassCard from '../components/ui/GlassCard';
import CosmicButton from '../components/ui/CosmicButton';
import CosmicIcon from '../components/ui/CosmicIcon';
import DateField from '../components/ui/DateField';
import LocationAutocomplete from '../components/ui/LocationAutocomplete';
import StepProgress from '../components/ui/StepProgress';
import TimeDialPicker from '../components/astrology/TimeDialPicker';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useOnboardingStore } from '../store/onboardingStore';
import { AuthStackParamList } from '../navigation/routes';

const STEPS = ['Date', 'Time', 'Location'];

export default function BirthDetailsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const setBirthDate = useOnboardingStore((s) => s.setBirthDate);
  const setBirthTime = useOnboardingStore((s) => s.setBirthTime);
  const setBirthLocation = useOnboardingStore((s) => s.setBirthLocation);
  const persistedLocation = useOnboardingStore((s) => s.birthLocation);

  const [step, setStep] = useState(0);
  const [date, setDate] = useState('1995-05-20');
  const [time, setTime] = useState({ hour: 8, minute: 30, ampm: 'AM' as 'AM' | 'PM' });
  const [locationText, setLocationText] = useState(persistedLocation?.label ?? '');
  const [locationData, setLocationData] = useState<{
    label: string;
    lat: number;
    lon: number;
    timezone?: string;
    tzOffsetMinutes?: number;
  } | null>(persistedLocation);

  const completed = useMemo(() => {
    const arr: number[] = [];
    if (step > 0) arr.push(0);
    if (step > 1) arr.push(1);
    return arr;
  }, [step]);

  const onPrimary = () => {
    if (step === 0) {
      if (!date) return;
      setBirthDate(date);
      setStep(1);
    } else if (step === 1) {
      setBirthTime(time);
      setStep(2);
    } else {
      if (!locationData) return;
      setBirthLocation(locationData);
      navigation.replace('AstrologerSelection');
    }
  };

  const onBack = () => {
    if (step === 0) navigation.goBack();
    else setStep(step - 1);
  };

  const cta =
    step === 0 ? 'Next: Time of Birth' : step === 1 ? 'Next: Location' : 'Reveal My Chart';

  const ctaDisabled =
    (step === 0 && !date) ||
    (step === 2 && !locationData);

  return (
    <CosmicBackground intensity="low">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScreenHeader
            title="Your Birth Details"
            subtitle="This helps us read your stars accurately"
            showBack
            onBack={onBack}
          />
          <StepProgress steps={STEPS} activeStep={step} completedSteps={completed} />

          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.stepLabel}>STEP {step + 1} OF 3</Text>
            <Text style={styles.stepHeading}>
              {step === 0 ? 'Select Date of Birth' : step === 1 ? 'Pick Time of Birth' : 'Birth Location'}
            </Text>
            <Text style={styles.stepSub}>
              {step === 0
                ? 'Choose your exact date of birth'
                : step === 1
                  ? 'Drag the dial or set AM/PM'
                  : 'Search for your city to set the right coordinates'}
            </Text>

            <GlassCard style={{ marginTop: spacing.md }}>
              {step === 0 && (
                <Animated.View entering={SlideInRight.springify()} exiting={SlideOutLeft}>
                  <DateField label="Birth Date" value={date} onChange={setDate} />
                  <View style={styles.row}>
                    <CosmicIcon name="info" color={colors.textMuted} size={14} />
                    <Text style={styles.helper}>Your data is secure and private</Text>
                  </View>
                </Animated.View>
              )}

              {step === 1 && (
                <Animated.View entering={FadeInDown} exiting={FadeOutUp}>
                  <TimeDialPicker
                    hour={time.hour}
                    minute={time.minute}
                    ampm={time.ampm}
                    onChange={(h, m) => setTime((t) => ({ ...t, hour: h, minute: m }))}
                    onAmpmChange={(a) => setTime((t) => ({ ...t, ampm: a }))}
                  />
                  <Text style={styles.helperCenter}>
                    Don't know? Tap "I'm not sure" to skip — we'll use 12:00 PM, which keeps
                    your Sun and Moon accurate even if your Ascendant won't be.
                  </Text>
                  <CosmicButton
                    title="I'm not sure of the time"
                    variant="outline"
                    onPress={() => {
                      const noon = { hour: 12, minute: 0, ampm: 'PM' as const };
                      setTime(noon);
                      setBirthTime(noon);
                      setStep(2);
                    }}
                    style={{ marginTop: spacing.md }}
                  />
                </Animated.View>
              )}

              {step === 2 && (
                <Animated.View entering={SlideInRight.springify()} exiting={SlideOutLeft}>
                  <LocationAutocomplete
                    label="Birth Location"
                    value={locationText}
                    onChangeText={(t) => {
                      setLocationText(t);
                      // Invalidate previously-selected coords if user starts typing again
                      if (locationData && t !== locationData.label) setLocationData(null);
                    }}
                    onSelect={(p) => {
                      const label = [p.name, p.admin1, p.country]
                        .filter(Boolean)
                        .join(', ');
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
                  <View style={styles.row}>
                    <CosmicIcon
                      name={locationData ? 'check' : 'info'}
                      color={locationData ? colors.success : colors.textMuted}
                      size={14}
                    />
                    <Text style={styles.helper}>
                      {locationData
                        ? `Coordinates locked: ${locationData.lat.toFixed(2)}, ${locationData.lon.toFixed(2)}`
                        : 'Pick a city from the dropdown for accurate placements'}
                    </Text>
                  </View>
                </Animated.View>
              )}
            </GlassCard>

            <View style={{ marginTop: spacing.lg }}>
              <CosmicButton
                title={cta}
                onPress={onPrimary}
                disabled={ctaDisabled}
                iconRight={step === 2 ? 'sparkle' : 'arrow-right'}
              />
              <Text style={styles.bottomNote}>Your data is secure and private</Text>
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
  },
  stepLabel: {
    ...typography.label,
    color: colors.goldPrimary,
    marginTop: spacing.sm,
  },
  stepHeading: {
    ...typography.section,
    color: colors.white,
    marginTop: 4,
  },
  stepSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  helper: {
    ...typography.caption,
    color: colors.textMuted,
    flexShrink: 1,
  },
  helperCenter: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  bottomNote: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
