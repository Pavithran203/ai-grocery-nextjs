import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Info, Trash2, Globe } from 'lucide-react-native';
import { COLORS, SPACING } from '../services/theme';

export default function SettingsScreen({ navigation }) {
  const handleDelete = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => Alert.alert("Account Deleted") }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={COLORS.foreground} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.group}>
          <Text style={styles.groupTitle}>General</Text>
          <TouchableOpacity style={styles.row}>
             <View style={styles.rowLeft}>
               <Globe size={20} color={COLORS.gray[500]} />
               <Text style={styles.rowText}>Language</Text>
             </View>
             <Text style={styles.rowSub}>English</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>About</Text>
          <View style={styles.row}>
             <View style={styles.rowLeft}>
               <Info size={20} color={COLORS.gray[500]} />
               <Text style={styles.rowText}>App Version</Text>
             </View>
             <Text style={styles.rowSub}>1.0.0 (POC)</Text>
          </View>
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Danger Zone</Text>
          <TouchableOpacity style={styles.row} onPress={handleDelete}>
             <View style={styles.rowLeft}>
               <Trash2 size={20} color={COLORS.rose[500]} />
               <Text style={[styles.rowText, { color: COLORS.rose[500] }]}>Delete Account</Text>
             </View>
          </TouchableOpacity>
        </View>
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
  group: { marginBottom: 30 },
  groupTitle: { fontSize: 13, fontWeight: '800', color: COLORS.gray[400], textTransform: 'uppercase', marginBottom: 12, marginLeft: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.gray[50], padding: 16, borderRadius: 16, marginBottom: 8 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { fontSize: 16, fontWeight: '600', color: COLORS.foreground },
  rowSub: { fontSize: 14, fontWeight: '600', color: COLORS.gray[400] },
});
