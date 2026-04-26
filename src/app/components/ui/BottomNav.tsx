import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import CosmicIcon, { IconName } from './CosmicIcon';

const ICONS: Record<string, IconName> = {
  Home: 'home',
  Chat: 'chat',
  BirthChart: 'chart',
  DailyInsight: 'star',
  Profile: 'profile',
};

const LABELS: Record<string, string> = {
  Home: 'Home',
  Chat: 'Chat',
  BirthChart: 'Charts',
  DailyInsight: 'Insights',
  Profile: 'Profile',
};

export default function BottomNav({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, i) => {
          const isFocused = state.index === i;
          const iconName = ICONS[route.name] ?? 'sparkle';
          const label = LABELS[route.name] ?? route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tab}
            >
              <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
                <CosmicIcon
                  name={iconName}
                  color={isFocused ? colors.goldBright : colors.textMuted}
                  size={20}
                />
              </View>
              <Text
                style={[
                  styles.label,
                  { color: isFocused ? colors.goldBright : colors.textMuted },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'rgba(8,8,23,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(246,200,95,0.18)',
  },
  bar: {
    flexDirection: 'row',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  iconWrapActive: {
    backgroundColor: 'rgba(246,200,95,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.35)',
    shadowColor: colors.goldPrimary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  label: {
    ...typography.caption,
    fontSize: 11,
    letterSpacing: 0.4,
    fontWeight: '500',
  },
});
