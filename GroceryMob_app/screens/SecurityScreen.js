import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Switch, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Lock, Fingerprint, ShieldCheck, Smartphone, LogOut, ChevronRight, X, Trash2 } from 'lucide-react-native';
import { COLORS, SPACING } from '../services/theme';

export default function SecurityScreen({ navigation }) {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handleChangePassword = () => {
    if (!currentPass || !newPass || !confirmPass) {
       Alert.alert("Missing Fields", "Please fill in all fields");
       return;
    }
    if (newPass !== confirmPass) {
       Alert.alert("Error", "New passwords do not match");
       return;
    }
    Alert.alert("Success", "Your password has been securely updated.");
    setShowPasswordModal(false);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  const handleLogoutAll = () => {
    Alert.alert("Log out of all devices", "Are you sure you want to log out of all active sessions?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => Alert.alert("Logged Out", "You have been logged out of all other devices.") }
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "This action is permanent and cannot be undone. Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => Alert.alert("Deleted", "Account deletion initiated.") }
    ]);
  };

  const SecurityOption = ({ icon: Icon, title, subtitle, onPress, rightElement, destructive }) => (
    <TouchableOpacity 
      style={[styles.optionContainer, destructive && styles.optionDestructive]} 
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={[styles.iconContainer, destructive && { backgroundColor: COLORS.rose[100] }]}>
        <Icon size={22} color={destructive ? COLORS.rose[500] : COLORS.primary} />
      </View>
      <View style={styles.optionTextContainer}>
        <Text style={[styles.optionTitle, destructive && { color: COLORS.rose[500] }]}>{title}</Text>
        {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement ? rightElement : (onPress ? <ChevronRight size={20} color={COLORS.gray[400]} /> : null)}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={COLORS.foreground} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.shieldContainer}>
          <View style={styles.shieldBg}>
            <ShieldCheck size={48} color={COLORS.emerald[600]} />
          </View>
          <Text style={styles.shieldTitle}>Your account is secure</Text>
          <Text style={styles.shieldSubtitle}>Last security check: Today at 9:41 AM</Text>
        </View>

        <Text style={styles.sectionTitle}>Authentication</Text>
        <View style={styles.sectionCard}>
          <SecurityOption 
            icon={Lock} 
            title="Change Password" 
            subtitle="Update your password regularly" 
            onPress={() => setShowPasswordModal(true)} 
          />
          <View style={styles.divider} />
          <SecurityOption 
            icon={Fingerprint} 
            title="Biometric Login" 
            subtitle="Use Face ID or Fingerprint" 
            rightElement={
              <Switch 
                value={biometricEnabled} 
                onValueChange={setBiometricEnabled}
                trackColor={{ false: COLORS.gray[200], true: COLORS.primary }}
              />
            }
          />
          <View style={styles.divider} />
          <SecurityOption 
            icon={ShieldCheck} 
            title="Two-Factor Auth (2FA)" 
            subtitle="Add an extra layer of security" 
            rightElement={
              <Switch 
                value={twoFactorEnabled} 
                onValueChange={setTwoFactorEnabled}
                trackColor={{ false: COLORS.gray[200], true: COLORS.primary }}
              />
            }
          />
        </View>

        <Text style={styles.sectionTitle}>Device Management</Text>
        <View style={styles.sectionCard}>
          <SecurityOption 
            icon={Smartphone} 
            title="Active Sessions" 
            subtitle="Manage devices logged into your account" 
            onPress={() => Alert.alert("Active Sessions", "You are currently logged in on 1 device.")} 
          />
          <View style={styles.divider} />
          <SecurityOption 
            icon={LogOut} 
            title="Log Out All Devices" 
            subtitle="Sign out from everywhere else" 
            onPress={handleLogoutAll} 
          />
        </View>

        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <View style={styles.sectionCard}>
          <SecurityOption 
            icon={Trash2} 
            title="Delete Account" 
            subtitle="Permanently remove your data" 
            onPress={handleDeleteAccount}
            destructive
          />
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Change Password Modal */}
      <Modal visible={showPasswordModal} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)} style={styles.closeBtn}>
                <X size={24} color={COLORS.gray[500]} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <TextInput style={styles.input} secureTextEntry value={currentPass} onChangeText={setCurrentPass} placeholder="Enter current password" placeholderTextColor={COLORS.gray[400]} />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput style={styles.input} secureTextEntry value={newPass} onChangeText={setNewPass} placeholder="Enter new password" placeholderTextColor={COLORS.gray[400]} />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput style={styles.input} secureTextEntry value={confirmPass} onChangeText={setConfirmPass} placeholder="Re-enter new password" placeholderTextColor={COLORS.gray[400]} />
            </View>
            
            <TouchableOpacity style={styles.btn} onPress={handleChangePassword}>
              <Text style={styles.btnText}>Update Password</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, height: 60, backgroundColor: COLORS.white },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.gray[50], justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.foreground },
  scrollContent: { padding: SPACING.lg },
  
  shieldContainer: { alignItems: 'center', marginBottom: SPACING.xl, marginTop: SPACING.md },
  shieldBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.emerald[400] + '20', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  shieldTitle: { fontSize: 20, fontWeight: '800', color: COLORS.foreground, marginBottom: 4 },
  shieldSubtitle: { fontSize: 13, color: COLORS.gray[500], fontWeight: '500' },
  
  sectionTitle: { fontSize: 13, fontWeight: '800', color: COLORS.gray[500], marginBottom: SPACING.sm, marginLeft: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionCard: { backgroundColor: COLORS.white, borderRadius: 20, marginBottom: SPACING.xl, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  
  optionContainer: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, paddingVertical: 14 },
  optionDestructive: { backgroundColor: COLORS.rose[100] + '30' },
  iconContainer: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.indigo[50], justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  optionTextContainer: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.foreground, marginBottom: 2 },
  optionSubtitle: { fontSize: 13, color: COLORS.gray[500], fontWeight: '500' },
  divider: { height: 1, backgroundColor: COLORS.gray[100], marginLeft: 72 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: SPACING.xl, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
  modalTitle: { fontSize: 24, fontWeight: '900', color: COLORS.foreground },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.gray[50], justifyContent: 'center', alignItems: 'center' },
  
  inputGroup: { marginBottom: SPACING.md },
  label: { fontSize: 14, fontWeight: '800', color: COLORS.foreground, marginBottom: 8 },
  input: { backgroundColor: COLORS.gray[50], paddingHorizontal: 16, height: 56, borderRadius: 16, fontSize: 16, borderWidth: 1, borderColor: COLORS.gray[200], color: COLORS.foreground, fontWeight: '500' },
  
  btn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: SPACING.lg },
  btnText: { color: COLORS.white, fontSize: 16, fontWeight: '900' }
});
