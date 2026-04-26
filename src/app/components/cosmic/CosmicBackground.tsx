import React, { useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, gradients } from '../../theme/colors';
import StarParticles from './StarParticles';
import ZodiacWheel from './ZodiacWheel';

export type CosmicVariant = 'default' | 'glass' | 'minimal' | 'chamber';

type Props = {
  variant?: CosmicVariant;
  showParticles?: boolean;
  showZodiacWheel?: boolean;
  intensity?: 'low' | 'medium' | 'high';
  children?: React.ReactNode;
  style?: ViewStyle;
};

export default function CosmicBackground({
  variant = 'default',
  showParticles = true,
  showZodiacWheel = false,
  intensity = 'medium',
  children,
  style,
}: Props) {
  const grad = useMemo(() => {
    if (variant === 'chamber') return gradients.chamber;
    if (variant === 'minimal') return gradients.deep;
    if (variant === 'glass') return gradients.cosmic;
    return gradients.cosmic;
  }, [variant]);

  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={grad as unknown as readonly [string, string, ...string[]]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      />

      {/* Soft purple radial glow at top */}
      <View pointerEvents="none" style={styles.topGlow} />
      <View pointerEvents="none" style={styles.bottomGlow} />

      {showZodiacWheel && (
        <View pointerEvents="none" style={styles.wheelLayer}>
          <ZodiacWheel size={520} opacity={0.08} showSigns={false} />
        </View>
      )}

      {showParticles && variant !== 'minimal' && (
        <StarParticles intensity={intensity} />
      )}

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  content: {
    flex: 1,
  },
  wheelLayer: {
    position: 'absolute',
    top: -120,
    left: -120,
    right: -120,
    bottom: -120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topGlow: {
    position: 'absolute',
    top: -150,
    left: -100,
    right: -100,
    height: 320,
    borderRadius: 320,
    backgroundColor: 'rgba(58,27,109,0.45)',
    opacity: 0.7,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -180,
    left: -80,
    right: -80,
    height: 280,
    borderRadius: 280,
    backgroundColor: 'rgba(37,16,71,0.45)',
    opacity: 0.6,
  },
});
