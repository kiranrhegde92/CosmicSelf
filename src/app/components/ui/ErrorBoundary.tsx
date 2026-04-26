import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import CosmicIcon from './CosmicIcon';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

/**
 * Catches uncaught render errors anywhere below it. Displays a calm cosmic
 * fallback with a Reset button instead of a white-screen-of-death. Any
 * error reporter (Sentry, Crashlytics) can be wired in `componentDidCatch`
 * later without touching call sites.
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('ErrorBoundary caught:', error, info.componentStack);
    }
    // TODO: forward to crash reporter once one is wired.
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={styles.root}>
        <View style={styles.iconCircle}>
          <CosmicIcon name="info" color={colors.error} size={28} />
        </View>
        <Text style={styles.title}>The cosmos hiccupped</Text>
        <Text style={styles.body}>
          Something unexpected happened. Tap below to realign.
        </Text>
        {__DEV__ && (
          <Text style={styles.detail} numberOfLines={6}>
            {this.state.error.message}
          </Text>
        )}
        <Pressable onPress={this.reset} style={styles.button} accessibilityLabel="Try again">
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,107,107,0.12)',
    borderWidth: 1.4,
    borderColor: 'rgba(255,107,107,0.55)',
  },
  title: {
    ...typography.section,
    color: colors.white,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
  },
  detail: {
    ...typography.caption,
    color: colors.textMuted,
    fontFamily: 'Menlo',
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.goldPrimary,
  },
  buttonText: {
    ...typography.button,
    color: '#1A0F33',
  },
});
