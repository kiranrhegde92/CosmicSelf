import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import CosmicIcon, { IconName } from './CosmicIcon';

type Props = TextInputProps & {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: IconName;
  rightIcon?: IconName;
  onRightPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  secureToggle?: boolean;
};

export default function CosmicInput({
  label,
  helperText,
  error,
  icon,
  rightIcon,
  onRightPress,
  containerStyle,
  secureToggle,
  secureTextEntry,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);
  const [hide, setHide] = useState(!!secureTextEntry);
  const focus = useSharedValue(0);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focus.value,
      [0, 1],
      [
        error ? colors.error : 'rgba(246,200,95,0.18)',
        error ? colors.error : colors.goldPrimary,
      ],
    ),
    shadowOpacity: 0.3 + focus.value * 0.4,
  }));

  return (
    <View style={[styles.wrap, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View
        style={[
          styles.field,
          {
            shadowColor: error ? colors.error : colors.goldPrimary,
          },
          borderStyle,
        ]}
      >
        {icon && (
          <View style={styles.iconLeft}>
            <CosmicIcon name={icon} color={focused ? colors.goldPrimary : colors.textMuted} size={20} />
          </View>
        )}
        <TextInput
          {...rest}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureToggle ? hide : secureTextEntry}
          onFocus={(e) => {
            setFocused(true);
            focus.value = withTiming(1, { duration: 180 });
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            focus.value = withTiming(0, { duration: 180 });
            rest.onBlur?.(e);
          }}
          style={[styles.input, !!icon && { paddingLeft: 0 }]}
        />
        {secureToggle && (
          <Pressable onPress={() => setHide((v) => !v)} style={styles.iconRight}>
            <CosmicIcon name={hide ? 'eye-off' : 'eye'} color={colors.textMuted} size={20} />
          </Pressable>
        )}
        {rightIcon && !secureToggle && (
          <Pressable onPress={onRightPress} style={styles.iconRight}>
            <CosmicIcon name={rightIcon} color={colors.goldPrimary} size={20} />
          </Pressable>
        )}
      </Animated.View>
      {(error || helperText) && (
        <Text style={[styles.helper, !!error && { color: colors.error }]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
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
    paddingHorizontal: spacing.md,
    height: 54,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowColor: colors.goldPrimary,
  },
  input: {
    flex: 1,
    color: colors.white,
    fontSize: 15,
    paddingVertical: 0,
    paddingHorizontal: spacing.sm,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    paddingLeft: spacing.sm,
    paddingVertical: 4,
  },
  helper: {
    ...typography.caption,
    marginTop: spacing.xs,
    marginLeft: 4,
    color: colors.textMuted,
  },
});
