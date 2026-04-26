import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import CosmicIcon from './CosmicIcon';

type Props = {
  label?: string;
  /** ISO 8601 date string YYYY-MM-DD */
  value: string;
  onChange: (iso: string) => void;
  helperText?: string;
};

export default function DateField({ label, value, onChange, helperText }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const date = parseDate(value);

  const onPickerChange = (e: DateTimePickerEvent, picked?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (e.type === 'dismissed') return;
    if (picked) onChange(toISO(picked));
  };

  const formatted = formatDisplay(value);

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        accessibilityLabel="Select birth date"
        onPress={() => setShowPicker((s) => !s)}
        style={styles.field}
      >
        <CosmicIcon name="calendar" color={colors.goldPrimary} size={20} />
        <Text style={[styles.value, !value && styles.placeholder]}>
          {formatted || 'Select your birth date'}
        </Text>
        <CosmicIcon name="chevron-down" color={colors.textMuted} size={16} />
      </Pressable>
      {helperText && <Text style={styles.helper}>{helperText}</Text>}

      {showPicker && (
        <View style={Platform.OS === 'ios' ? styles.iosWrap : undefined}>
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
            onChange={onPickerChange}
            themeVariant="dark"
          />
          {Platform.OS === 'ios' && (
            <Pressable onPress={() => setShowPicker(false)} style={styles.iosDone}>
              <Text style={styles.iosDoneText}>Done</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

function parseDate(iso: string): Date {
  if (!iso) return new Date(1995, 4, 20);
  const [y, m, d] = iso.split('-').map((s) => parseInt(s, 10));
  if (!y || !m || !d) return new Date(1995, 4, 20);
  return new Date(y, m - 1, d);
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatDisplay(iso: string): string {
  if (!iso) return '';
  const d = parseDate(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const styles = StyleSheet.create({
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginLeft: 4,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20,18,41,0.7)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.18)',
    paddingHorizontal: spacing.md,
    height: 54,
    gap: spacing.sm,
  },
  value: {
    ...typography.body,
    color: colors.white,
    flex: 1,
  },
  placeholder: {
    color: colors.textMuted,
  },
  helper: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginLeft: 4,
  },
  iosWrap: {
    backgroundColor: 'rgba(20,18,41,0.95)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.18)',
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  iosDone: {
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  iosDoneText: {
    ...typography.button,
    color: colors.goldBright,
  },
});
