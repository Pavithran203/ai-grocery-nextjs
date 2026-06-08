import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bike } from 'lucide-react-native';
import { COLORS, SPACING } from '../services/theme';
import { useTracking } from '../context/TrackingContext';

export default function LiveTrackingCard() {
  const { isTracking, currentStage, eta, distanceKm, getProximityMessage, activeOrderId } = useTracking();
  const navigation = useNavigation();

  if (!isTracking || currentStage === 'Delivered' || currentStage === 'Cancelled') {
    return null; // Don't show if not actively tracking
  }

  return (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.9} 
      onPress={() => navigation.navigate('TrackingScreen', { orderId: activeOrderId })}
    >
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={styles.iconBox}>
            <Bike size={20} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.title}>Delivery in Progress</Text>
            <Text style={styles.subtitle}>{getProximityMessage()}</Text>
          </View>
        </View>
        <View style={styles.etaBox}>
          <Text style={styles.etaTime}>{eta} min</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {currentStage === 'Order Placed' || currentStage === 'Packed' 
             ? `Order #${activeOrderId?.slice(0,6) || 'N/A'} is being prepared` 
             : `Distance: ${distanceKm < 1 ? Math.round(distanceKm * 1000) + 'm' : distanceKm.toFixed(1) + 'km'}`
          }
        </Text>
        <Text style={styles.trackText}>Live Map ➔</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    borderRadius: 20,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.foreground,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  etaBox: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  etaTime: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.white,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  footerText: {
    fontSize: 12,
    color: COLORS.gray[500],
    fontWeight: '600',
  },
  trackText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  }
});
