import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { LogIn, UserPlus, X } from 'lucide-react-native';
import { COLORS } from '../services/theme';

const { width } = Dimensions.get('window');

export default function LoginPromptModal({ visible, onClose, onLogin, onSignup, onGuest }) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBody}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={20} color={COLORS.gray[500]} />
          </TouchableOpacity>

          <View style={styles.iconCircle}>
            <LogIn size={32} color={COLORS.primary} />
          </View>

          <Text style={styles.title}>Login Required</Text>
          <Text style={styles.subtitle}>
            Please log in or create an account to proceed with this action.
          </Text>

          <TouchableOpacity 
            style={[styles.button, styles.loginButton]} 
            onPress={onLogin}
          >
            <LogIn size={20} color={COLORS.white} />
            <Text style={styles.loginText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.signupButton]} 
            onPress={onSignup}
          >
            <UserPlus size={20} color={COLORS.primary} />
            <Text style={styles.signupText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.guestButton} onPress={onGuest}>
            <Text style={styles.guestText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalBody: {
    backgroundColor: 'white',
    borderRadius: 24,
    width: width - 40,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20
  },
  button: {
    flexDirection: 'row',
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10
  },
  loginButton: {
    backgroundColor: COLORS.primary,
  },
  signupButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  loginText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700'
  },
  signupText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700'
  },
  guestButton: {
    marginTop: 8
  },
  guestText: {
    color: COLORS.gray[500],
    fontSize: 14,
    fontWeight: '600'
  }
});
