import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, 
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../services/theme';
import { 
  ChevronLeft, Mail, Lock, Phone, ArrowRight, 
  CheckCircle2, AlertCircle, Eye, EyeOff 
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import OTPInput from '../components/OTPInput';

export default function LoginScreen({ navigation }) {
  const { login, loginAsGuest, sendOTP, verifyOTP } = useAuth();
  
  const [method, setMethod] = useState('phone'); // 'phone', 'email', 'forgot'
  const [step, setStep] = useState(1); // 1: input, 2: otp
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const validatePhone = (num) => num.length >= 10;
  const validateEmail = (mail) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);

  const handlePhoneSubmit = async () => {
    if (!validatePhone(phone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    const res = await sendOTP(phone);
    setLoading(false);
    if (res.success) {
      setStep(2);
      setTimer(60);
      if (res.dev_otp) {
        console.log("DEV OTP:", res.dev_otp);
        Alert.alert("Debug Mode", `OTP Sent: ${res.dev_otp}`);
      }
    } else {
      Alert.alert('Error', res.message);
    }
  };

  const handleOTPSubmit = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    const res = await verifyOTP(phone, otp);
    setLoading(false);
    if (res.success) {
      navigation.replace('Main');
    } else {
      Alert.alert('Verification Failed', res.message);
    }
  };

  const handleEmailLogin = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (!password) {
      Alert.alert('Password Required', 'Please enter your password.');
      return;
    }
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigation.replace('Main');
    } else {
      Alert.alert('Login Failed', res.message);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    await loginAsGuest();
    setLoading(false);
    navigation.replace('Main');
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    setLoading(true);
    const res = await sendOTP(phone);
    setLoading(false);
    if (res.success) {
      setTimer(60);
      Alert.alert("Success", "New OTP has been sent.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => step === 2 ? setStep(1) : navigation.goBack()}>
              <ChevronLeft color={COLORS.foreground} size={24} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.guestBtn} onPress={handleGuestLogin}>
              <Text style={styles.guestBtnText}>Skip</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.main}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoEmoji}>🛒</Text>
              </View>
              <Text style={styles.brandName}>NearMart</Text>
              <Text style={styles.tagline}>Smart Local Grocery Marketplace</Text>
            </View>

            {method === 'phone' && step === 1 && (
              <View style={styles.form}>
                <Text style={styles.title}>Login or Signup</Text>
                <Text style={styles.subtitle}>Enter your mobile number to get started</Text>
                
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Mobile Number</Text>
                  <View style={styles.phoneInputRow}>
                    <View style={styles.countryCode}>
                      <Text style={styles.countryCodeText}>+91</Text>
                    </View>
                    <TextInput 
                      style={styles.phoneInput}
                      placeholder="99999 00000"
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={phone}
                      onChangeText={setPhone}
                      placeholderTextColor={COLORS.gray[300]}
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.primaryBtn, !validatePhone(phone) && styles.disabledBtn]}
                  onPress={handlePhoneSubmit}
                  disabled={loading || !validatePhone(phone)}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <Text style={styles.primaryBtnText}>Continue</Text>
                      <ArrowRight size={20} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.switchBtn} onPress={() => setMethod('email')}>
                  <Text style={styles.switchBtnText}>Use Email instead</Text>
                </TouchableOpacity>
              </View>
            )}

            {method === 'phone' && step === 2 && (
              <View style={styles.form}>
                <Text style={styles.title}>Verify OTP</Text>
                <Text style={styles.subtitle}>Sent to +91 {phone}</Text>
                
                <OTPInput value={otp} onChangeText={setOtp} />

                <TouchableOpacity 
                  style={[styles.primaryBtn, otp.length < 6 && styles.disabledBtn]}
                  onPress={handleOTPSubmit}
                  disabled={loading || otp.length < 6}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : (
                    <Text style={styles.primaryBtnText}>Verify & Login</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.resendRow}>
                  {timer > 0 ? (
                    <Text style={styles.timerText}>Resend OTP in {timer}s</Text>
                  ) : (
                    <TouchableOpacity onPress={handleResendOTP}>
                      <Text style={styles.resendText}>Resend OTP</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {method === 'email' && (
              <View style={styles.form}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in with your registered email</Text>

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

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputContainer}>
                    <Lock size={18} color={COLORS.gray[400]} />
                    <TextInput 
                      style={styles.input}
                      placeholder="••••••••"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} color={COLORS.gray[400]} /> : <Eye size={18} color={COLORS.gray[400]} />}
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity style={styles.forgotPassBtn} onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgotPassText}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.primaryBtn, (!validateEmail(email) || !password) && styles.disabledBtn]}
                  onPress={handleEmailLogin}
                  disabled={loading || !validateEmail(email) || !password}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : (
                    <Text style={styles.primaryBtnText}>Sign In</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.switchBtn} onPress={() => setMethod('phone')}>
                  <Text style={styles.switchBtnText}>Use Phone Number instead</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New to NearMart? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: SPACING.md 
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.gray[50], justifyContent: 'center', alignItems: 'center' },
  guestBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.gray[50] },
  guestBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.gray[600] },
  main: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 80, height: 80, borderRadius: 30, backgroundColor: COLORS.primary + '10', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoEmoji: { fontSize: 40 },
  brandName: { fontSize: 28, fontWeight: '900', color: COLORS.foreground, marginBottom: 4 },
  tagline: { fontSize: 14, color: COLORS.gray[400], fontWeight: '600' },
  form: { gap: 20 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.foreground },
  subtitle: { fontSize: 14, color: COLORS.gray[500], lineHeight: 20, marginBottom: 10 },
  inputWrapper: { gap: 8 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: COLORS.gray[600], marginLeft: 4 },
  phoneInputRow: { flexDirection: 'row', gap: 12 },
  countryCode: { width: 60, height: 56, backgroundColor: COLORS.gray[50], borderRadius: 16, borderWIdth: 1, borderColor: COLORS.gray[100], justifyContent: 'center', alignItems: 'center' },
  countryCodeText: { fontSize: 16, fontWeight: '700', color: COLORS.foreground },
  phoneInput: { flex: 1, height: 56, backgroundColor: COLORS.gray[50], borderRadius: 16, borderWidth: 1, borderColor: COLORS.gray[100], paddingHorizontal: 16, fontSize: 18, fontWeight: '700', color: COLORS.foreground },
  inputContainer: { flexDirection: 'row', alignItems: 'center', height: 56, backgroundColor: COLORS.gray[50], borderRadius: 16, borderWidth: 1, borderColor: COLORS.gray[100], paddingHorizontal: 16, gap: 12 },
  input: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.foreground },
  primaryBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  disabledBtn: { opacity: 0.6, shadowOpacity: 0 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  switchBtn: { alignSelf: 'center', marginTop: 10 },
  switchBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  forgotPassBtn: { alignSelf: 'flex-end', marginTop: -10 },
  forgotPassText: { fontSize: 13, fontWeight: '600', color: COLORS.gray[500] },
  resendRow: { alignItems: 'center', marginTop: 10 },
  timerText: { fontSize: 14, color: COLORS.gray[400], fontWeight: '600' },
  resendText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  footerText: { fontSize: 14, color: COLORS.gray[500], fontWeight: '600' },
  signupText: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
});
