import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import CosmicBackground from '../components/cosmic/CosmicBackground';
import GlassCard from '../components/ui/GlassCard';
import ScreenHeader from '../components/ui/ScreenHeader';
import CosmicIcon from '../components/ui/CosmicIcon';
import {
  SavedInsight,
  savedInsightsRepository,
} from '../services/savedInsightsRepository';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { MainStackParamList } from '../navigation/routes';

export default function SavedInsightsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [items, setItems] = useState<SavedInsight[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const list = await savedInsightsRepository.list();
    setItems(list);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const onDelete = (id: string) => {
    Alert.alert('Remove insight?', 'This will delete the saved insight from your collection.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const ok = await savedInsightsRepository.remove(id);
          if (ok) setItems((prev) => (prev ?? []).filter((i) => i.id !== id));
        },
      },
    ]);
  };

  return (
    <CosmicBackground intensity="low">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader
          title="Saved Insights"
          subtitle="Your cosmic memory book"
          showBack
          onBack={() => navigation.goBack()}
        />
        {items === null ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.goldPrimary} />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.center}>
            <CosmicIcon name="book" color={colors.goldPrimary} size={32} />
            <Text style={styles.emptyTitle}>Nothing saved yet</Text>
            <Text style={styles.emptyBody}>
              Tap "Save Insight" on a daily reading and it will appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(it) => it.id}
            contentContainerStyle={styles.list}
            refreshing={refreshing}
            onRefresh={onRefresh}
            renderItem={({ item }) => (
              <GlassCard style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.glyphWrap}>
                    <Text style={styles.glyph}>{item.zodiacGlyph}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardDate}>{item.date}</Text>
                    <Text style={styles.cardHeadline}>{item.headline}</Text>
                  </View>
                  <Pressable
                    onPress={() => onDelete(item.id)}
                    accessibilityLabel="Delete insight"
                    hitSlop={10}
                  >
                    <CosmicIcon name="close" color={colors.textMuted} size={16} />
                  </Pressable>
                </View>
                <Text style={styles.cardBody} numberOfLines={4}>
                  {item.body}
                </Text>
              </GlassCard>
            )}
          />
        )}
      </SafeAreaView>
    </CosmicBackground>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.screenH,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typography.section,
    color: colors.white,
    marginTop: spacing.sm,
  },
  emptyBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    marginVertical: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  glyphWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(246,200,95,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.4)',
  },
  glyph: {
    fontSize: 22,
    color: colors.goldBright,
  },
  cardDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  cardHeadline: {
    ...typography.bodyStrong,
    color: colors.white,
  },
  cardBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
});
