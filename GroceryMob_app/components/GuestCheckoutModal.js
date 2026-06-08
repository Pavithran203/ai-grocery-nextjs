import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Modal, TouchableOpacity, 
  TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert 
} from 'react-native';
import { COLORS, SPACING } from '../services/theme';
import { X, User, Phone, MapPin, ChevronRight, Lock } from 'lucide-react-native';
import { useLanguage } from '../context/LanguageContext';

export default function GuestCheckoutModal({ visible, onClose, onContinue, onLogin, initialStep = 1 }) {
  const { t } = useLanguage();
  const [step, setStep] = useState(initialStep); // 1: prompt, 2: guest form
  
  React.useEffect(() => {
    if (visible) setStep(initialStep);
  }, [visible, initialStep]);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleContinueAsGuest = () => {
    if (!name || !phone) {
      Alert.alert(t('Missing Information'), t('Please fill in your name and mobile number to proceed.'));
      return;
    }
    onContinue({ 
      name, 
      phone,
      address: null // Address is handled by CheckoutScreen
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{step === 1 ? t('Checkout Options') : t('Guest Details')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={COLORS.gray[400]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
            {step === 1 ? (
              <View style={styles.promptContainer}>
                <View style={styles.iconCircle}>
                  <User size={40} color={COLORS.primary} />
                </View>
                <Text style={styles.title}>{t('Almost there!')}</Text>
                <Text style={styles.subtitle}>{t('Login to earn coins and track your orders easily, or continue as a guest.')}</Text>
                
                <TouchableOpacity style={styles.loginBtn} onPress={onLogin}>
                  <Lock size={18} color="#fff" />
                  <Text style={styles.loginBtnText}>{t('Login / Sign Up')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.guestBtn} onPress={() => setStep(2)}>
                  <Text style={styles.guestBtnText}>{t('Continue as Guest')}</Text>
                  <ChevronRight size={18} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('Full Name')}</Text>
                  <View style={styles.inputBox}>
                    <User size={18} color={COLORS.gray[400]} />
                    <TextInput 
                      style={styles.input}
                      placeholder={t('Enter your name')}
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('Mobile Number')}</Text>
                  <View style={styles.inputBox}>
                    <Phone size={18} color={COLORS.gray[400]} />
                    <TextInput 
                      style={styles.input}
                      placeholder={t('10-digit mobile number')}
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={phone}
                      onChangeText={setPhone}
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.submitBtn, (!name || !phone) && styles.disabledBtn]} 
                  onPress={handleContinueAsGuest}
                >
                  <Text style={styles.submitBtnText}>{t('Proceed to Place Order')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backLink} onPress={() => setStep(1)}>
                  <Text style={styles.backLinkText}>{t('Back to options')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: COLORS.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 30, maxHeight: '85%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.gray[50] },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.foreground },
  closeBtn: { padding: 4 },
  content: { padding: 24 },
  promptContainer: { alignItems: 'center', paddingBottom: 20 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary + '10', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '900', color: COLORS.foreground, marginBottom: 12 },
  subtitle: { fontSize: 15, color: COLORS.gray[500], textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  loginBtn: { backgroundColor: COLORS.primary, width: '100%', height: 56, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 16 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  guestBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10 },
  guestBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  form: { gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.gray[600], marginLeft: 4 },
  inputBox: { flexDirection: 'row', alignItems: 'center', height: 54, backgroundColor: COLORS.gray[50], borderRadius: 14, borderWidth: 1, borderColor: COLORS.gray[100], paddingHorizontal: 16, gap: 10 },
  input: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.foreground },
  row: { flexDirection: 'row', gap: 12 },
  rowInput: { flex: 1 },
  submitBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  disabledBtn: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  backLink: { alignSelf: 'center', marginTop: 10 },
  backLinkText: { fontSize: 14, fontWeight: '600', color: COLORS.gray[400] }
});
