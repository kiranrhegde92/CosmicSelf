import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import ScreenHeader from '../components/ui/ScreenHeader';
import GlassCard from '../components/ui/GlassCard';
import CosmicIcon, { IconName } from '../components/ui/CosmicIcon';
import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useAppStore } from '../store/appStore';
import { notificationsService } from '../services/notificationsService';
import { MainStackParamList } from '../navigation/routes';

type ItemType = 'switch' | 'navigate' | 'value';

type Item = {
  key: string;
  label: string;
  icon: IconName;
  type: ItemType;
  value?: string;
  route?: keyof MainStackParamList;
};

type Section = {
  key: string;
  title: string;
  items: Item[];
};

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const themeMode = useAppStore((s) => s.themeMode);
  const setThemeMode = useAppStore((s) => s.setThemeMode);

  const pushEnabled = useAppStore((s) => s.pushEnabled);
  const setPushEnabled = useAppStore((s) => s.setPushEnabled);
  const horoscopeEnabled = useAppStore((s) => s.dailyHoroscopeEnabled);
  const setHoroscopeEnabled = useAppStore((s) => s.setDailyHoroscopeEnabled);
  const soundscape = useAppStore((s) => s.cosmicSoundscapeEnabled);
  const setSoundscape = useAppStore((s) => s.setCosmicSoundscapeEnabled);

  const togglePush = async (next: boolean) => {
    setPushEnabled(next);
    if (!next) {
      await notificationsService.cancelDailyHoroscope();
    } else if (horoscopeEnabled) {
      await notificationsService.scheduleDailyHoroscope();
    }
  };

  const toggleHoroscope = async (next: boolean) => {
    setHoroscopeEnabled(next);
    if (next && pushEnabled) {
      await notificationsService.scheduleDailyHoroscope();
    } else {
      await notificationsService.cancelDailyHoroscope();
    }
  };

  const sections: Section[] = [
    {
      key: 'account',
      title: 'Account',
      items: [
        { key: 'edit', label: 'Edit Profile', icon: 'user', type: 'navigate' },
        { key: 'birth', label: 'Birth Details', icon: 'calendar', type: 'navigate' },
        { key: 'language', label: 'Language', icon: 'orbit', type: 'value', value: 'English' },
      ],
    },
    {
      key: 'notifications',
      title: 'Notifications',
      items: [
        { key: 'push', label: 'Push Notifications', icon: 'bell', type: 'switch' },
        { key: 'horoscope', label: 'Daily Horoscope', icon: 'sparkle', type: 'switch' },
      ],
    },
    {
      key: 'astrologer',
      title: 'Astrologer Preferences',
      items: [
        { key: 'mychan', label: 'My Astrologer', icon: 'star', type: 'navigate' },
        { key: 'mode', label: 'Mode', icon: 'sun', type: 'value', value: 'Serious' },
      ],
    },
    {
      key: 'theme',
      title: 'Theme',
      items: [
        { key: 'theme', label: 'Theme Mode', icon: 'moon', type: 'value', value: themeMode === 'glass' ? 'Glass' : 'Default' },
        { key: 'sound', label: 'Cosmic Soundscape', icon: 'magic', type: 'switch' },
      ],
    },
    {
      key: 'privacy',
      title: 'Privacy',
      items: [
        { key: 'data', label: 'Data & Permissions', icon: 'shield', type: 'navigate' },
        { key: 'export', label: 'Export My Data', icon: 'arrow-up', type: 'navigate' },
      ],
    },
    {
      key: 'subscription',
      title: 'Subscription',
      items: [
        { key: 'plan', label: 'Manage Plan', icon: 'crown', type: 'navigate', route: 'Subscription' },
      ],
    },
    {
      key: 'help',
      title: 'Help',
      items: [
        { key: 'faq', label: 'FAQ', icon: 'info', type: 'navigate' },
        { key: 'contact', label: 'Contact Support', icon: 'chat', type: 'navigate' },
      ],
    },
  ];

  const switchValue = (key: string) => {
    if (key === 'push') return pushEnabled;
    if (key === 'horoscope') return horoscopeEnabled;
    if (key === 'sound') return soundscape;
    return false;
  };

  const onToggle = (key: string) => {
    if (key === 'push') return togglePush(!pushEnabled);
    if (key === 'horoscope') return toggleHoroscope(!horoscopeEnabled);
    if (key === 'sound') return setSoundscape(!soundscape);
  };

  return (
    <CosmicBackground intensity="low">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader
          title="Settings"
          showBack
          onBack={() => navigation.goBack()}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {sections.map((section) => (
            <View key={section.key} style={{ marginBottom: spacing.lg }}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <GlassCard padding={0} style={styles.card}>
                {section.items.map((item, idx) => (
                  <Pressable
                    key={item.key}
                    style={[
                      styles.row,
                      idx === section.items.length - 1 && { borderBottomWidth: 0 },
                    ]}
                    onPress={() => {
                      if (item.type === 'switch') return onToggle(item.key);
                      if (item.route) navigation.navigate(item.route as any);
                      if (item.key === 'theme') {
                        setThemeMode(themeMode === 'default' ? 'glass' : 'default');
                      }
                    }}
                    accessibilityLabel={item.label}
                  >
                    <View style={styles.iconBox}>
                      <CosmicIcon name={item.icon} color={colors.goldPrimary} size={15} />
                    </View>
                    <Text style={styles.label}>{item.label}</Text>
                    {item.type === 'switch' ? (
                      <Switch
                        value={switchValue(item.key)}
                        onValueChange={() => onToggle(item.key)}
                        thumbColor={switchValue(item.key) ? colors.goldBright : '#fff'}
                        trackColor={{ false: '#3A1B6D', true: colors.goldMuted }}
                      />
                    ) : item.type === 'value' ? (
                      <Text style={styles.value}>{item.value}</Text>
                    ) : (
                      <CosmicIcon name="chevron-right" color={colors.textMuted} size={16} />
                    )}
                  </Pressable>
                ))}
              </GlassCard>
            </View>
          ))}
          <Text style={styles.version}>CosmicSelf v1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.screenH,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.goldPrimary,
    marginBottom: spacing.xs,
    marginLeft: 4,
  },
  card: {
    overflow: 'hidden',
    borderRadius: radii.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(246,200,95,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    ...typography.body,
    color: colors.white,
    fontSize: 14,
  },
  value: {
    ...typography.caption,
    color: colors.goldPrimary,
  },
  version: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
