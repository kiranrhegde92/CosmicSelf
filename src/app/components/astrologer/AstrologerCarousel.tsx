import React, { useRef } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  View,
  ViewToken,
} from 'react-native';

import AstrologerCard from './AstrologerCard';
import { Astrologer } from '../../data/astrologers';
import { spacing } from '../../theme/spacing';

type Props = {
  data: Astrologer[];
  selectedId: string;
  onSelect: (id: string) => void;
};

const { width: SCREEN_W } = Dimensions.get('window');
const ITEM_W = 200;
const SPACING = 14;

export default function AstrologerCarousel({ data, selectedId, onSelect }: Props) {
  const listRef = useRef<FlatList<Astrologer>>(null);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const center = viewableItems.find((v) => v.isViewable);
    if (center && center.item) {
      const id = (center.item as Astrologer).id;
      if (id !== selectedId) onSelect(id);
    }
  }).current;

  React.useEffect(() => {
    const idx = data.findIndex((a) => a.id === selectedId);
    if (idx >= 0) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.5 });
      });
    }
  }, [selectedId, data]);

  return (
    <View style={styles.wrap}>
      <FlatList
        ref={listRef}
        data={data}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_W + SPACING}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: (SCREEN_W - ITEM_W) / 2,
        }}
        ItemSeparatorComponent={() => <View style={{ width: SPACING }} />}
        getItemLayout={(_, i) => ({
          length: ITEM_W + SPACING,
          offset: (ITEM_W + SPACING) * i,
          index: i,
        })}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item }) => (
          <AstrologerCard
            astrologer={item}
            selected={item.id === selectedId}
            onPress={() => onSelect(item.id)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: spacing.md,
  },
});
