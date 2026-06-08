import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, CreditCard } from 'lucide-react-native';
import { COLORS, SPACING } from '../services/theme';

export default function PaymentMethodsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={COLORS.foreground} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <CreditCard size={24} color={COLORS.primary} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardInfoText}>•••• •••• •••• 4242</Text>
            <Text style={styles.cardSubText}>Visa</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={{ fontSize: 20 }}>📱</Text>
          <View style={styles.cardInfo}>
            <Text style={styles.cardInfoText}>user@upi</Text>
            <Text style={styles.cardSubText}>Google Pay</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add New Payment Method</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, height: 60 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.gray[50], justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.foreground },
  content: { padding: SPACING.md },
  card: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.gray[50], borderRadius: 16, marginBottom: 12 },
  cardInfo: { marginLeft: 16 },
  cardInfoText: { fontSize: 16, fontWeight: '700', color: COLORS.foreground },
  cardSubText: { fontSize: 13, color: COLORS.gray[500], marginTop: 4 },
  addBtn: { marginTop: 24, paddingVertical: 16, borderRadius: 16, borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed', alignItems: 'center' },
  addBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 16 },
});
