import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import ScreenHeader from '../components/ui/ScreenHeader';
import ToggleMode from '../components/ui/ToggleMode';
import CosmicButton from '../components/ui/CosmicButton';
import AstrologerCarousel from '../components/astrologer/AstrologerCarousel';
import { ASTROLOGERS } from '../data/astrologers';
import { useOnboardingStore } from '../store/onboardingStore';
import { spacing } from '../theme/spacing';
import { MainStackParamList } from '../navigation/routes';

export default function EditAstrologerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const setAstrologer = useOnboardingStore((s) => s.setAstrologer);
  const setMode = useOnboardingStore((s) => s.setMode);
  const mode = useOnboardingStore((s) => s.mode);
  const initialId = useOnboardingStore((s) => s.selectedAstrologerId) ?? 'veda';

  const [selectedId, setSelectedId] = useState(initialId);

  const onSave = () => {
    setAstrologer(selectedId);
    navigation.goBack();
  };

  return (
    <CosmicBackground intensity="medium" showZodiacWheel>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader
          title="My Astrologer"
          subtitle="Switch your guide"
          showBack
          onBack={() => navigation.goBack()}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.toggleWrap}>
            <ToggleMode
              options={[
                { key: 'serious', label: 'Serious Mode', icon: 'shield' },
                { key: 'fun', label: 'Fun Mode', icon: 'sparkle' },
              ]}
              value={mode}
              onChange={(k) => setMode(k as 'serious' | 'fun')}
            />
          </View>

          <View style={{ marginTop: spacing.md }}>
            <AstrologerCarousel
              data={ASTROLOGERS}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </View>

          <View style={{ paddingHorizontal: spacing.screenH, marginTop: spacing.lg }}>
            <CosmicButton title="Save" onPress={onSave} iconRight="check" />
          </View>
        </ScrollView>
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xl,
  },
  toggleWrap: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});
