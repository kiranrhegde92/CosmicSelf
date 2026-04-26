import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = {
  label: string;
  tone?: 'gold' | 'purple' | 'rose' | 'blue' | 'mint';
};

export default function PersonaBadge({ label, tone = 'gold' }: Props) {
  return (
    <View style={[styles.wrap, toneStyle(tone)]}>
      <Text style={[styles.label, toneText(tone)]}>{label}</Text>
    </View>
  );
}

function toneStyle(t: Props['tone']) {
  switch (t) {
    case 'purple':
      return { backgroundColor: 'rgba(58,27,109,0.55)', borderColor: 'rgba(184,138,255,0.55)' };
    case 'rose':
      return { backgroundColor: 'rgba(170,60,140,0.4)', borderColor: 'rgba(255,140,200,0.6)' };
    case 'blue':
      return { backgroundColor: 'rgba(20,40,120,0.5)', borderColor: 'rgba(120,160,255,0.6)' };
    case 'mint':
      return { backgroundColor: 'rgba(20,90,80,0.45)', borderColor: 'rgba(110,220,180,0.6)' };
    default:
      return { backgroundColor: 'rgba(246,200,95,0.12)', borderColor: 'rgba(246,200,95,0.55)' };
  }
}

function toneText(t: Props['tone']) {
  switch (t) {
    case 'purple':
      return { color: '#D6C7FF' };
    case 'rose':
      return { color: '#FFC2DC' };
    case 'blue':
      return { color: '#BAD0FF' };
    case 'mint':
      return { color: '#9DEDCB' };
    default:
      return { color: colors.goldBright };
  }
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.pill,
    fontSize: 11,
  },
});
