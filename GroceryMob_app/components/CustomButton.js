import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SPACING } from '../services/theme';

export default function CustomButton({ title, onPress, type = 'primary', loading = false, style, textStyle }) {
  const isSecondary = type === 'secondary';
  const isOutline = type === 'outline';

  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.8}
      disabled={loading}
      style={[
        styles.button,
        isSecondary && styles.secondary,
        isOutline && styles.outline,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? COLORS.primary : COLORS.white} />
      ) : (
        <Text style={[
          styles.text,
          isOutline && styles.outlineText,
          textStyle
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  secondary: {
    backgroundColor: COLORS.foreground,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
    elevation: 0,
    shadowOpacity: 0,
  },
  text: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  outlineText: {
    color: COLORS.primary,
  }
});
