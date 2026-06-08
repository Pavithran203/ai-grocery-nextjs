import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Search, User, ChevronDown, Bell } from 'lucide-react-native';
import { COLORS, SPACING } from '../services/theme';
import { useLocation } from '../context/LocationContext';
import { useLanguage } from '../context/LanguageContext';

export default function Header({ title, showSearch = true, onSearchPress, onProfilePress, onAddressPress, onNotificationPress }) {
  const { locationText, hasLocation } = useLocation();
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>NM</Text>
          </View>
          {/* Tapping the address/location area navigates to AddressScreen */}
          <TouchableOpacity onPress={onAddressPress} activeOpacity={0.7} style={{ flexShrink: 1, paddingRight: 10 }}>
            <Text style={styles.brandName}>
              Near<Text style={{ color: COLORS.accent }}>Mart</Text>
            </Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationText} numberOfLines={1}>{locationText || t('Set your location')}</Text>
              <ChevronDown size={12} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={onNotificationPress}>
            <Bell size={20} color={COLORS.foreground} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          {showSearch && (
            <TouchableOpacity style={styles.iconBtn} onPress={onSearchPress}>
              <Search size={20} color={COLORS.foreground} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconBtn} onPress={onProfilePress}>
            <User size={20} color={COLORS.foreground} />
          </TouchableOpacity>
        </View>
      </View>
      {title && <Text style={styles.title}>{title}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: { color: COLORS.white, fontWeight: '900', fontSize: 18 },
  brandName: { fontSize: 16, fontWeight: '800', color: COLORS.foreground, letterSpacing: -0.5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  locationText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  actions: { flexDirection: 'row', gap: 10 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.gray[50],
    justifyContent: 'center', alignItems: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  title: {
    fontSize: 28, fontWeight: '900', color: COLORS.foreground, marginTop: SPACING.sm,
  },
});
