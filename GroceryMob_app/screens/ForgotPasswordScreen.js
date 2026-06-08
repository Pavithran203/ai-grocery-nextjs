import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../services/theme';
import { ChevronLeft, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import OTPInput from '../components/OTPInput';
import { api } from '../services/api';

export default function ForgotPasswordScreen({ navigation }) {
  const { forgotPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }
    setLoading(true);
    const res = await forgotPassword(email);
    setLoading(false);
    if (res.success) {
      Alert.alert(
        'Email Sent', 
        'Password reset instructions have been sent to your email.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } else {
      Alert.alert('Error', res.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft color={COLORS.foreground} size={24} />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.logoCircle}>
              <ShieldCheck size={40} color={COLORS.primary} />
            </View>

            <View style={styles.form}>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>Enter your email address and we'll send you instructions to reset your password.</Text>
              
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Mail size={18} color={COLORS.gray[400]} />
                  <TextInput 
                    style={styles.input}
                    placeholder="name@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.primaryBtn, !email && styles.disabledBtn]}
                onPress={handleEmailSubmit}
                disabled={loading || !email}
              >
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Text style={styles.primaryBtnText}>Send Reset Link</Text>
                    <ArrowRight size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  backBtn: { 
    width: 40, height: 40, borderRadius: 20, 
    backgroundColor: COLORS.gray[50], 
    justifyContent: 'center', alignItems: 'center',
    margin: SPACING.md
  },
  content: { paddingHorizontal: 24, alignItems: 'center' },
  logoCircle: { width: 80, height: 80, borderRadius: 30, backgroundColor: COLORS.primary + '10', justifyContent: 'center', alignItems: 'center', marginBottom: 30, marginTop: 20 },
  form: { width: '100%', gap: 20 },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.foreground, textAlign: 'center' },
  subtitle: { fontSize: 15, color: COLORS.gray[500], textAlign: 'center', lineHeight: 22, marginBottom: 10 },
  inputWrapper: { gap: 8 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: COLORS.gray[600], marginLeft: 4 },
  inputContainer: { 
    flexDirection: 'row', alignItems: 'center', 
    height: 56, backgroundColor: COLORS.gray[50], 
    borderRadius: 16, borderWidth: 1, borderColor: COLORS.gray[100], 
    paddingHorizontal: 16, gap: 12 
  },
  input: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.foreground },
  primaryBtn: { 
    backgroundColor: COLORS.primary, height: 56, borderRadius: 16, 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', 
    gap: 10, marginTop: 10,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 
  },
  disabledBtn: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  resendBtn: { alignSelf: 'center', marginTop: 10 },
  resendText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
});
