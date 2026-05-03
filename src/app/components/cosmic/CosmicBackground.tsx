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
      {/* Base multi-stop cosmic gradient — diagonal so the corners feel
          uneven and atmospheric, not centered. */}
      <LinearGradient
        colors={grad as unknown as readonly [string, string, ...string[]]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Off-center purple bloom at top-left — adds painted depth. */}
      <View pointerEvents="none" style={styles.topGlow} />
      {/* Warm gold bloom at center-right — rare and subtle. */}
      <View pointerEvents="none" style={styles.midGlow} />
      {/* Deep violet bloom at bottom — grounds the screen. */}
      <View pointerEvents="none" style={styles.bottomGlow} />

      {/* Vignette — darkens corners so center reads as the focus. */}
      <LinearGradient
        pointerEvents="none"
        colors={[
          'rgba(8,8,23,0)',
          'rgba(8,8,23,0)',
          'rgba(8,8,23,0.45)',
        ]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0.4 }}
        end={{ x: 0.5, y: 1 }}
      />

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
    top: -180,
    left: -120,
    width: 420,
    height: 420,
    borderRadius: 420,
    backgroundColor: 'rgba(90,42,159,0.55)',
    opacity: 0.85,
  },
  midGlow: {
    position: 'absolute',
    top: '38%',
    right: -160,
    width: 360,
    height: 360,
    borderRadius: 360,
    backgroundColor: 'rgba(246,200,95,0.10)',
    opacity: 0.9,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -200,
    right: -60,
    width: 380,
    height: 380,
    borderRadius: 380,
    backgroundColor: 'rgba(58,27,109,0.55)',
    opacity: 0.7,
  },
});
