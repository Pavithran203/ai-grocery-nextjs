import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../services/theme';
import { useLanguage } from '../../context/LanguageContext';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getGreetingEmoji() {
  const hour = new Date().getHours();
  if (hour < 12) return '🌅';
  if (hour < 17) return '☀️';
  return '🌙';
}

export default function WelcomeSection() {
  const { t } = useLanguage();
  const greeting = getGreeting();
  const emoji = getGreetingEmoji();

  return (
    <View style={styles.container}>
      <View style={styles.greetingRow}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.greeting}>{t(greeting)}</Text>
      </View>
      <Text style={styles.subtitle}>
        {t('Find nearby grocery stores and daily essentials')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.foreground,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray[500],
    fontWeight: '500',
    marginTop: 4,
    marginLeft: 2,
  },
});
