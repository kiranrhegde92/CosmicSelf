import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import CosmicIcon from './CosmicIcon';

type Props = {
  steps: string[];
  activeStep: number;
  completedSteps?: number[];
};

export default function StepProgress({ steps, activeStep, completedSteps = [] }: Props) {
  return (
    <View style={styles.wrap}>
      {steps.map((label, idx) => {
        const isCompleted = completedSteps.includes(idx) || idx < activeStep;
        const isActive = idx === activeStep;
        const isLast = idx === steps.length - 1;
        return (
          <React.Fragment key={label}>
            <View style={styles.stepCol}>
              <View
                style={[
                  styles.dot,
                  isActive && styles.dotActive,
                  isCompleted && styles.dotCompleted,
                ]}
              >
                {isCompleted ? (
                  <CosmicIcon name="check" color={colors.bgPrimary} size={14} strokeWidth={2.5} />
                ) : (
                  <Text
                    style={[
                      styles.dotText,
                      isActive && { color: colors.bgPrimary },
                    ]}
                  >
                    {idx + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  isActive && { color: colors.goldBright },
                  isCompleted && { color: colors.goldPrimary },
                ]}
              >
                {label}
              </Text>
            </View>
            {!isLast && (
              <View
                style={[
                  styles.line,
                  (isCompleted || idx < activeStep) && styles.lineActive,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.md,
  },
  stepCol: {
    alignItems: 'center',
    width: 70,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(20,18,41,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(246,200,95,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    backgroundColor: colors.goldPrimary,
    borderColor: colors.goldBright,
    shadowColor: colors.goldPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 10,
    elevation: 6,
  },
  dotCompleted: {
    backgroundColor: colors.goldMuted,
    borderColor: colors.goldPrimary,
  },
  dotText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 6,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(246,200,95,0.18)',
    marginTop: 16,
    marginHorizontal: -10,
  },
  lineActive: {
    backgroundColor: colors.goldPrimary,
    height: 1.5,
    shadowColor: colors.goldPrimary,
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
});
