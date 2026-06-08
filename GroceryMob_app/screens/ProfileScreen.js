import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Image, 
  ScrollView, Modal, TextInput, KeyboardAvoidingView, 
  Platform, Switch, ActivityIndicator, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../services/theme';
import { 
  ChevronRight, Settings, CreditCard, MapPin, Bell, 
  LogOut, ShieldCheck, X, Globe, Heart, Camera, 
  User, ShoppingBag, Star, HelpCircle, Info
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useLoyalty } from '../context/LoyaltyContext';
import { useOrders } from '../context/OrdersContext';
import { useWishlist } from '../context/WishlistContext';
import RewardsModal from '../components/RewardsModal';

const LANG_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
];

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateProfile } = useAuth();
  const { t, language, changeLanguage } = useLanguage();
  const { coins } = useLoyalty();
  const { orders } = useOrders();
  const { wishlist } = useWishlist();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLangModal, setIsLangModal] = useState(false);
  const [isRewardsModal, setIsRewardsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Sync state when user changes (e.g. after login/update)
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
    }
  }, [user]);

  const pickImage = async () => {
    if (user?.isGuest) {
      Alert.alert('Login Required', 'Please login to update your profile picture.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setLoading(true);
      await updateProfile({ avatar: result.assets[0].uri });
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }
    setLoading(true);
    const res = await updateProfile({ name: editName, phone: editPhone });
    setLoading(false);
    if (res.success) {
      setIsEditing(false);
    } else {
      Alert.alert('Update Failed', res.message);
    }
  };

  const MenuOption = ({ icon: Icon, label, onPress, sublabel, color = COLORS.foreground, isToggle, value, onToggle }) => (
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={onPress} 
      disabled={isToggle}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconContainer, { backgroundColor: color + '10' }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuLabel}>{label}</Text>
        {sublabel && <Text style={styles.menuSublabel}>{sublabel}</Text>}
      </View>
      {isToggle ? (
        <Switch 
          value={value} 
          onValueChange={onToggle}
          trackColor={{ false: COLORS.gray[200], true: COLORS.primary }}
        />
      ) : (
        <ChevronRight size={18} color={COLORS.gray[300]} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
                </Text>
              </View>
            )}
            <View style={styles.camBadge}>
              <Camera size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || (user?.isGuest ? 'Guest User' : 'Welcome, Guest')}</Text>
            <Text style={styles.userMeta}>{user?.isGuest ? 'Browse Mode' : (user?.email || 'Login to sync data')}</Text>
            {user?.phone && <Text style={styles.userMeta}>+91 {user.phone}</Text>}
          </View>

          {!user?.isGuest && (
            <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
              <Settings size={20} color={COLORS.gray[400]} />
            </TouchableOpacity>
          )}
        </View>

        {/* Stats / Quick Info */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('OrdersTab')}>
            <Text style={styles.statValue}>{orders.length}</Text>
            <Text style={styles.statLabel}>{t('Orders')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => setIsRewardsModal(true)}>
            <Text style={[styles.statValue, { color: '#D97706' }]}>{coins}</Text>
            <Text style={styles.statLabel}>{t('Coins')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('WishlistScreen')}>
            <Text style={styles.statValue}>{wishlist.length}</Text>
            <Text style={styles.statLabel}>{t('Saved')}</Text>
          </TouchableOpacity>
        </View>

        {(!user || user.isGuest) && (
          <View style={styles.loginCTA}>
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaTitle}>{user?.isGuest ? t('Unlock Personalization') : t('Join FreshKart')}</Text>
              <Text style={styles.ctaSubtitle}>{t('Login to save favorite stores, track your orders, and enjoy faster checkout.')}</Text>
              <View style={styles.benefitList}>
                <View style={styles.benefitItem}>
                  <Heart size={12} color="rgba(255,255,255,0.8)" fill="rgba(255,255,255,0.8)" />
                  <Text style={styles.benefitText}>{t('Save Favorite Stores')}</Text>
                </View>
                <View style={styles.benefitItem}>
                  <ShoppingBag size={12} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.benefitText}>{t('Track Order History')}</Text>
                </View>
              </View>
            </View>
            <View style={{ gap: 8, marginLeft: 12 }}>
              <TouchableOpacity style={styles.ctaBtn} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.ctaBtnText}>{t('Login')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.ctaBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#fff' }]} onPress={() => navigation.navigate('Signup')}>
                <Text style={[styles.ctaBtnText, { color: '#fff' }]}>{t('Sign Up')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Account Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.menuCard}>
            <MenuOption 
              icon={MapPin} 
              label={t("Delivery Addresses")} 
              sublabel={user?.addresses?.length ? `${user.addresses.length} ${t('saved addresses')}` : t('Manage locations')}
              onPress={() => {
                if (user?.isGuest) {
                  Alert.alert(t('Login Required'), t('Please login to save and manage your delivery addresses.'));
                } else {
                  navigation.navigate('AddressScreen');
                }
              }}
              color={COLORS.primary}
            />
            <MenuOption 
              icon={CreditCard} 
              label={t("Payment Methods")} 
              sublabel={t("Cards, UPI & Wallets")}
              onPress={() => {
                if (user?.isGuest) {
                  Alert.alert(t('Login Required'), t('Please login to manage your payment methods.'));
                } else {
                  navigation.navigate('PaymentMethodsScreen');
                }
              }}
              color={COLORS.indigo[500]}
            />
            <MenuOption 
              icon={Heart} 
              label={t("Favorite Stores")} 
              sublabel={t("Stores you love")}
              onPress={() => {
                 navigation.navigate('StoresTab');
              }}
              color={COLORS.rose[500]}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.menuCard}>
            <MenuOption 
              icon={Globe} 
              label="Language" 
              sublabel={LANG_OPTIONS.find(l => l.code === language)?.label}
              onPress={() => setIsLangModal(true)}
              color={COLORS.emerald[500]}
            />
            <MenuOption 
              icon={Bell} 
              label="Notifications" 
              isToggle={true}
              value={notificationsEnabled}
              onToggle={setNotificationsEnabled}
              color={COLORS.saffron[500]}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Legal</Text>
          <View style={styles.menuCard}>
            <MenuOption icon={HelpCircle} label="Help & Support" color={COLORS.gray[400]} />
            <MenuOption icon={Info} label="About NearMart" color={COLORS.gray[400]} />
          </View>
        </View>

        {user && (
          <TouchableOpacity style={styles.logoutBtn} onPress={() => logout()}>
            <LogOut size={20} color={COLORS.rose[500]} />
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.versionText}>Version 2.1.0 • Made with ❤️</Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditing} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setIsEditing(false)}>
                <X size={24} color={COLORS.foreground} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput 
                style={styles.modalInput} 
                value={editName} 
                onChangeText={setEditName} 
                placeholder="Enter your name"
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput 
                style={styles.modalInput} 
                value={editPhone} 
                onChangeText={setEditPhone} 
                keyboardType="phone-pad"
                maxLength={10}
                placeholder="Enter 10-digit number"
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email Address (Read-only)</Text>
              <TextInput 
                style={[styles.modalInput, { color: COLORS.gray[400], backgroundColor: COLORS.gray[100] }]} 
                value={user?.email} 
                editable={false}
              />
              <Text style={{ fontSize: 11, color: COLORS.gray[400], marginLeft: 4 }}>
                Email cannot be changed once registered.
              </Text>
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal visible={isLangModal} animationType="fade" transparent>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsLangModal(false)}>
          <View style={styles.langContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            {LANG_OPTIONS.map(opt => (
              <TouchableOpacity 
                key={opt.code} 
                style={[styles.langOpt, language === opt.code && styles.langOptActive]}
                onPress={() => {
                  changeLanguage(opt.code);
                  setIsLangModal(false);
                }}
              >
                <Text style={[styles.langOptText, language === opt.code && styles.langOptTextActive]}>{opt.label}</Text>
                {language === opt.code && <View style={styles.dot} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <RewardsModal visible={isRewardsModal} onClose={() => setIsRewardsModal(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { paddingBottom: 100 },
  profileHeader: { 
    flexDirection: 'row', alignItems: 'center', 
    padding: 24, backgroundColor: '#fff', 
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 70, height: 70, borderRadius: 30 },
  avatarPlaceholder: { 
    width: 70, height: 70, borderRadius: 30, 
    backgroundColor: COLORS.primary + '10', 
    justifyContent: 'center', alignItems: 'center' 
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: COLORS.primary },
  camBadge: { 
    position: 'absolute', bottom: -2, right: -2, 
    backgroundColor: COLORS.primary, width: 22, height: 22, 
    borderRadius: 11, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff'
  },
  profileInfo: { flex: 1, marginLeft: 16 },
  userName: { fontSize: 20, fontWeight: '800', color: COLORS.foreground },
  userMeta: { fontSize: 13, color: COLORS.gray[400], marginTop: 2, fontWeight: '600' },
  editBtn: { padding: 8 },
  
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, marginTop: -20, gap: 12 },
  statCard: { 
    flex: 1, backgroundColor: '#fff', padding: 16, 
    borderRadius: 20, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
  },
  statValue: { fontSize: 18, fontWeight: '900', color: COLORS.foreground },
  statLabel: { fontSize: 12, color: COLORS.gray[400], fontWeight: '700', marginTop: 2 },

  loginCTA: { 
    flexDirection: 'row', alignItems: 'center', 
    margin: 20, padding: 20, 
    backgroundColor: COLORS.primary, borderRadius: 24,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.2, shadowRadius: 15, elevation: 5
  },
  ctaTextContainer: { flex: 1 },
  ctaTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
  ctaSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  ctaBtn: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  ctaBtnText: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
  benefitList: { marginTop: 12, gap: 6 },
  benefitItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  benefitText: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '700' },

  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.gray[400], marginBottom: 12, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1 },
  menuCard: { backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F3F5' },
  menuIconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuTextContainer: { flex: 1, marginLeft: 16 },
  menuLabel: { fontSize: 15, fontWeight: '700', color: COLORS.foreground },
  menuSublabel: { fontSize: 12, color: COLORS.gray[400], marginTop: 2 },

  logoutBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    gap: 8, marginTop: 40, alignSelf: 'center' 
  },
  logoutBtnText: { fontSize: 16, fontWeight: '800', color: COLORS.rose[500] },
  versionText: { textAlign: 'center', marginTop: 20, fontSize: 12, color: COLORS.gray[300], fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '90%', borderRadius: 32, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: COLORS.foreground },
  inputWrapper: { gap: 8, marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: COLORS.gray[600], marginLeft: 4 },
  modalInput: { backgroundColor: '#F8F9FA', height: 56, borderRadius: 16, paddingHorizontal: 16, fontSize: 16, fontWeight: '600', color: COLORS.foreground },
  saveBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  langContent: { backgroundColor: '#fff', width: '80%', borderRadius: 32, padding: 24 },
  langOpt: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F3F5' },
  langOptActive: { borderBottomColor: COLORS.primary },
  langOptText: { fontSize: 16, fontWeight: '700', color: COLORS.gray[600] },
  langOptTextActive: { color: COLORS.primary },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary }
});
