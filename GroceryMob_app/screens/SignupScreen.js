import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../services/theme';
import { 
  ChevronLeft, Mail, Lock, Phone, User, 
  ArrowRight, Eye, EyeOff 
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export default function SignupScreen({ navigation }) {
  const { signup } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name.trim()) return 'Full Name is required.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email.';
    if (!phone.trim() || phone.length < 10) return 'Enter a valid 10-digit mobile number.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSignup = async () => {
    const error = validate();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }

    setLoading(true);
    const result = await signup({ name, email, phone, password });
    setLoading(false);

    if (result.success) {
      Alert.alert('Welcome!', 'Your account has been created successfully.');
      navigation.replace('Main');
    } else {
      Alert.alert('Signup Failed', result.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft color={COLORS.foreground} size={24} />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Join NearMart</Text>
              <Text style={styles.subtitle}>Get fresh groceries and daily essentials delivered to your doorstep.</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <User size={18} color={COLORS.gray[400]} />
                  <TextInput 
                    style={styles.input}
                    placeholder="Enter your full name"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

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
                <Text style={styles.inputLabel}>Mobile Number</Text>
                <View style={styles.inputContainer}>
                  <Phone size={18} color={COLORS.gray[400]} />
                  <TextInput 
                    style={styles.input}
                    placeholder="99999 00000"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputContainer}>
                  <Lock size={18} color={COLORS.gray[400]} />
                  <TextInput 
                    style={styles.input}
                    placeholder="Min. 6 characters"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} color={COLORS.gray[400]} /> : <Eye size={18} color={COLORS.gray[400]} />}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <Lock size={18} color={COLORS.gray[400]} />
                  <TextInput 
                    style={styles.input}
                    placeholder="Re-enter password"
                    secureTextEntry={!showPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.primaryBtn, loading && styles.disabledBtn]}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Text style={styles.primaryBtnText}>Create Account</Text>
                    <ArrowRight size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.signinText}>Sign In</Text>
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
  content: { paddingHorizontal: 24 },
  header: { marginBottom: 30 },
  title: { fontSize: 32, fontWeight: '900', color: COLORS.foreground, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.gray[400], lineHeight: 22 },
  form: { gap: 16 },
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
  disabledBtn: { opacity: 0.7 },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  footerText: { fontSize: 14, color: COLORS.gray[500], fontWeight: '600' },
  signinText: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
});
