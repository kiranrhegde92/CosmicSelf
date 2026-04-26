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
import CosmicInput from '../components/ui/CosmicInput';
import CosmicButton from '../components/ui/CosmicButton';
import CosmicIcon from '../components/ui/CosmicIcon';
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

  const [step, setStep] = useState(0);
  const [date, setDate] = useState('20 May 1995');
  const [time, setTime] = useState({ hour: 8, minute: 30, ampm: 'AM' as 'AM' | 'PM' });
  const [location, setLocation] = useState('');

  const completed = useMemo(() => {
    const arr: number[] = [];
    if (step > 0) arr.push(0);
    if (step > 1) arr.push(1);
    return arr;
  }, [step]);

  const onPrimary = () => {
    if (step === 0) {
      if (!date.trim()) return;
      setBirthDate(date);
      setStep(1);
    } else if (step === 1) {
      setBirthTime(time);
      setStep(2);
    } else {
      if (!location.trim()) return;
      setBirthLocation(location);
      navigation.replace('AstrologerSelection');
    }
  };

  const onBack = () => {
    if (step === 0) navigation.goBack();
    else setStep(step - 1);
  };

  const cta =
    step === 0 ? 'Next: Time of Birth' : step === 1 ? 'Next: Location' : 'Reveal My Chart';

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
                  : 'City, state or country'}
            </Text>

            <GlassCard style={{ marginTop: spacing.md }}>
              {step === 0 && (
                <Animated.View entering={SlideInRight.springify()} exiting={SlideOutLeft}>
                  <CosmicInput
                    label="Birth Date"
                    placeholder="DD MMM YYYY"
                    icon="calendar"
                    value={date}
                    onChangeText={setDate}
                  />
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
                  <Text style={styles.helperCenter}>If you're unsure, set 12:00 PM</Text>
                </Animated.View>
              )}

              {step === 2 && (
                <Animated.View entering={SlideInRight.springify()} exiting={SlideOutLeft}>
                  <CosmicInput
                    label="Birth Location"
                    placeholder="e.g. Mumbai, India"
                    icon="map-pin"
                    value={location}
                    onChangeText={setLocation}
                  />
                  <View style={styles.row}>
                    <CosmicIcon name="info" color={colors.textMuted} size={14} />
                    <Text style={styles.helper}>We use this only to calculate your chart</Text>
                  </View>
                </Animated.View>
              )}
            </GlassCard>

            <View style={{ marginTop: spacing.lg }}>
              <CosmicButton
                title={cta}
                onPress={onPrimary}
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
