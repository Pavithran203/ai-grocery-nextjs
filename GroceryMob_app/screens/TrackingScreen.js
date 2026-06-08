import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Marker, Polyline, AnimatedRegion, MarkerAnimated } from 'react-native-maps';
import { ChevronLeft, Phone, MessageSquare, MapPin, Package, Store, Bike } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../services/theme';
import { useTracking } from '../context/TrackingContext';

const { width, height } = Dimensions.get('window');
const STAGES = ['Order Placed', 'Packed', 'Out for Delivery', 'Arriving Soon', 'Delivered'];

export default function TrackingScreen({ navigation }) {
  const { 
    isTracking, activeOrderId, routeCoords, 
    userLoc, warehouseLoc, riderLoc, heading, 
    currentStage, eta, distanceKm, getProximityMessage 
  } = useTracking();

  const mapRef = useRef(null);

  // Animated Region for smooth rider tracking
  const riderLocAnim = useRef(new AnimatedRegion({
    latitude: riderLoc.latitude,
    longitude: riderLoc.longitude,
    latitudeDelta: 0,
    longitudeDelta: 0,
  })).current;

  // Fit map to route coordinates
  useEffect(() => {
    if (mapRef.current && routeCoords.length > 0) {
      setTimeout(() => {
        mapRef.current.fitToCoordinates(routeCoords, {
          edgePadding: { top: 100, right: 50, bottom: 400, left: 50 },
          animated: true,
        });
      }, 1000);
    }
  }, [routeCoords]);

  // Smoothly animate rider to new context location
  useEffect(() => {
    // Determine dynamic duration based on route length to match context interval
    const duration = routeCoords.length > 0 ? 60000 / routeCoords.length : 1000;
    
    riderLocAnim.timing({
      latitude: riderLoc.latitude,
      longitude: riderLoc.longitude,
      duration: duration,
      useNativeDriver: false,
    }).start();
  }, [riderLoc]);

  const currentStageIndex = STAGES.indexOf(currentStage) !== -1 ? STAGES.indexOf(currentStage) : 0;

  if (!isTracking) {
    return (
      <SafeAreaView style={styles.container}>
         <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
           <ChevronLeft color={COLORS.foreground} size={24} />
         </TouchableOpacity>
         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
           <Text style={{ fontSize: 18, color: COLORS.gray[500] }}>Loading Tracking...</Text>
         </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{ ...userLoc, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
      >
        {/* Draw Real Road Route */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor={COLORS.primary}
            strokeWidth={5}
          />
        )}

        {/* Warehouse Marker */}
        <Marker coordinate={warehouseLoc} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={[styles.markerBox, { backgroundColor: COLORS.indigo[600] }]}>
            <Store color="white" size={20} />
          </View>
        </Marker>

        {/* User Marker */}
        <Marker coordinate={userLoc} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={[styles.markerBox, { backgroundColor: COLORS.rose[500] }]}>
            <MapPin color="white" size={20} />
          </View>
        </Marker>

        {/* Smooth Rider Marker */}
        {currentStageIndex >= 2 && (
          <MarkerAnimated coordinate={riderLocAnim} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={[styles.riderMarker, { transform: [{ rotate: `${heading}deg` }] }]}>
              <Bike color={COLORS.primary} size={24} />
            </View>
          </MarkerAnimated>
        )}
      </MapView>

      <SafeAreaView style={styles.headerSafeArea} pointerEvents="box-none">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color={COLORS.foreground} size={24} />
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.bottomSheet}>
        <View style={styles.dragHandle} />
        
        <View style={styles.etaHeader}>
          <View>
            <Text style={styles.etaTitle}>
              {currentStageIndex === 0 ? 'Getting ready...' : 
               currentStageIndex === 1 ? 'Packing order...' : 
               currentStageIndex >= 4 ? 'Delivered' : 'Arriving in'}
            </Text>
            {currentStageIndex >= 2 && currentStageIndex < 4 && <Text style={styles.etaTime}>{eta} mins</Text>}
          </View>
          <View style={styles.orderBadge}>
            <Text style={styles.orderBadgeText}>{activeOrderId?.slice(0,8) || 'ORDER'}</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          
          {/* Proximity Message */}
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: COLORS.primary }}>
               {getProximityMessage()}
            </Text>
          </View>

          {/* Timeline */}
          <View style={styles.timelineContainer}>
            {STAGES.map((stage, idx) => {
              const active = idx === currentStageIndex;
              const passed = idx <= currentStageIndex;
              
              return (
                <View key={stage} style={styles.timelineStep}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, passed && styles.timelineDotPassed, active && styles.timelineDotActive]} />
                    {idx < STAGES.length - 1 && <View style={[styles.timelineLine, passed && idx < currentStageIndex && styles.timelineLinePassed]} />}
                  </View>
                  <View style={styles.timelineRight}>
                    <Text style={[styles.timelineText, active && styles.timelineTextActive]}>{stage}</Text>
                    {active && <Text style={styles.timelineSubtext}>
                      {idx === 0 && 'We have received your order.'}
                      {idx === 1 && 'Your items are being packed securely.'}
                      {idx === 2 && 'Rider has picked up your order and is navigating traffic.'}
                      {idx === 3 && 'Rider is very close to your location.'}
                      {idx === 4 && 'Order delivered successfully.'}
                    </Text>}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Rider Details (Only show when Out for delivery or later) */}
          {currentStageIndex >= 2 && (
            <View style={styles.riderCard}>
               <View style={styles.riderAvatar}>
                 <Package color={COLORS.primary} size={24} />
               </View>
               <View style={styles.riderInfo}>
                 <Text style={styles.riderName}>Ramesh Kumar</Text>
                 <Text style={styles.riderVehicle}>TN 09 AB 1234 • Bike</Text>
               </View>
               <View style={styles.actionBtns}>
                 <TouchableOpacity style={styles.iconBtn}>
                   <MessageSquare color={COLORS.primary} size={20} />
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.iconBtn, { backgroundColor: COLORS.emerald[50] }]}>
                   <Phone color={COLORS.emerald[600]} size={20} />
                 </TouchableOpacity>
               </View>
            </View>
          )}

        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  map: { width, height: height * 0.7 },
  headerSafeArea: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: SPACING.md },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  markerBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  riderMarker: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.primary, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  
  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.55, backgroundColor: COLORS.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: SPACING.xl, paddingTop: SPACING.md, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20 },
  dragHandle: { width: 40, height: 5, borderRadius: 3, backgroundColor: COLORS.gray[200], alignSelf: 'center', marginBottom: SPACING.lg },
  
  etaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
  etaTitle: { fontSize: 14, color: COLORS.gray[500], fontWeight: '600', marginBottom: 4 },
  etaTime: { fontSize: 32, fontWeight: '900', color: COLORS.foreground },
  orderBadge: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.gray[50], borderRadius: 12, borderWidth: 1, borderColor: COLORS.gray[200] },
  orderBadgeText: { fontSize: 13, fontWeight: '700', color: COLORS.gray[600] },

  timelineContainer: { marginBottom: SPACING.xl },
  timelineStep: { flexDirection: 'row', minHeight: 60 },
  timelineLeft: { width: 30, alignItems: 'center' },
  timelineDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.gray[200], zIndex: 2 },
  timelineDotPassed: { backgroundColor: COLORS.primary },
  timelineDotActive: { borderWidth: 3, borderColor: COLORS.primary + '30' },
  timelineLine: { position: 'absolute', top: 14, bottom: 0, width: 2, backgroundColor: COLORS.gray[200], zIndex: 1 },
  timelineLinePassed: { backgroundColor: COLORS.primary },
  timelineRight: { flex: 1, paddingLeft: SPACING.sm, paddingBottom: SPACING.lg },
  timelineText: { fontSize: 16, fontWeight: '700', color: COLORS.gray[400] },
  timelineTextActive: { color: COLORS.foreground },
  timelineSubtext: { fontSize: 13, color: COLORS.gray[500], marginTop: 4, lineHeight: 20 },

  riderCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray[50], padding: SPACING.md, borderRadius: 20, borderWidth: 1, borderColor: COLORS.gray[100] },
  riderAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  riderInfo: { flex: 1 },
  riderName: { fontSize: 16, fontWeight: '800', color: COLORS.foreground, marginBottom: 2 },
  riderVehicle: { fontSize: 12, color: COLORS.gray[500], fontWeight: '600' },
  actionBtns: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center' },
});
