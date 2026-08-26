import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const { colors } = useTheme();

  const containerStyle: ViewStyle = {
    ...styles.base,
    ...sizeStyles[size],
    ...(variant === 'primary' && { backgroundColor: colors.accent }),
    ...(variant === 'secondary' && { backgroundColor: colors.surfaceElevated }),
    ...(variant === 'outline' && {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.accent,
    }),
    ...(variant === 'ghost' && { backgroundColor: 'transparent' }),
    ...(disabled && { opacity: 0.5 }),
  };

  const labelStyle: TextStyle = {
    ...styles.label,
    ...labelSizeStyles[size],
    ...(variant === 'primary' && { color: '#FFFFFF' }),
    ...(variant === 'secondary' && { color: colors.text }),
    ...(variant === 'outline' && { color: colors.accent }),
    ...(variant === 'ghost' && { color: colors.accent }),
  };

  return (
    <TouchableOpacity
      style={[containerStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.accent} size="small" />
      ) : (
        <Text style={[labelStyle, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

const sizeStyles: Record<string, ViewStyle> = {
  sm: { paddingHorizontal: 16, paddingVertical: 8 },
  md: { paddingHorizontal: 24, paddingVertical: 14 },
  lg: { paddingHorizontal: 32, paddingVertical: 18 },
};

const labelSizeStyles: Record<string, TextStyle> = {
  sm: { fontSize: 13 },
  md: { fontSize: 15 },
  lg: { fontSize: 17 },
};
