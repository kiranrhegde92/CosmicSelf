import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { geocodingService, type GeocodedPlace } from '../../services/geocodingService';
import CosmicIcon from './CosmicIcon';
import CosmicInput from './CosmicInput';

type Props = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (place: GeocodedPlace) => void;
  placeholder?: string;
  helperText?: string;
};

export default function LocationAutocomplete({
  label,
  value,
  onChangeText,
  onSelect,
  placeholder = 'e.g. Mumbai, India',
  helperText,
}: Props) {
  const [results, setResults] = useState<GeocodedPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestRef = useRef(0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim() || value.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const id = ++requestRef.current;
      setLoading(true);
      try {
        const r = await geocodingService.search(value);
        if (id === requestRef.current) {
          setResults(r);
          setOpen(true);
        }
      } finally {
        if (id === requestRef.current) setLoading(false);
      }
    }, 280);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  return (
    <View>
      <CosmicInput
        label={label}
        icon="map-pin"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        helperText={helperText}
      />
      {open && (loading || results.length > 0) && (
        <View style={styles.dropdown}>
          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.goldPrimary} />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          )}
          {!loading &&
            results.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => {
                  onSelect(p);
                  setOpen(false);
                }}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                accessibilityLabel={`${p.name}, ${p.country ?? ''}`}
              >
                <CosmicIcon name="map-pin" color={colors.goldPrimary} size={14} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.placeName}>{p.name}</Text>
                  <Text style={styles.placeMeta}>
                    {[p.admin1, p.country].filter(Boolean).join(', ')}
                  </Text>
                </View>
              </Pressable>
            ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.32)',
    backgroundColor: 'rgba(20,18,41,0.96)',
    overflow: 'hidden',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  loadingText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  rowPressed: {
    backgroundColor: 'rgba(58,27,109,0.45)',
  },
  placeName: {
    ...typography.body,
    color: colors.white,
    fontSize: 14,
  },
  placeMeta: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
});
