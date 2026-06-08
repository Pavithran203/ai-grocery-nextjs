import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Modal, TextInput, ScrollView, KeyboardAvoidingView,
  Platform, Alert, ActivityIndicator, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Plus, MapPin, Edit3, Trash2, CheckCircle, X, Navigation } from 'lucide-react-native';
import { COLORS, SPACING } from '../services/theme';
import { useAddress } from '../context/AddressContext';
import { useLocation } from '../context/LocationContext';

const EMPTY_FORM = {
  label: 'Home',
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
};

export default function AddressScreen({ navigation }) {
  const { addresses, defaultAddressId, addAddress, editAddress, deleteAddress, selectDefaultAddress, formatAddress } = useAddress();
  const { getCurrentAddress } = useLocation();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalVisible(true);
  };

  const openEdit = (addr) => {
    setEditingId(addr.id);
    setForm({
      label: addr.label || 'Home',
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      line1: addr.line1 || '',
      line2: addr.line2 || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
    });
    setErrors({});
    setModalVisible(true);
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    if (!form.line1.trim()) e.line1 = 'Address line is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.pincode.trim()) e.pincode = 'Pincode is required';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    if (editingId) {
      editAddress(editingId, form);
    } else {
      addAddress(form);
    }
    setModalVisible(false);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Address', 'Are you sure you want to remove this address?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAddress(id) },
    ]);
  };

  const setField = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
  };

  const handleAutoLocation = async () => {
    setFetchingLocation(true);
    try {
      const address = await getCurrentAddress();
      setForm(prev => ({
        ...prev,
        line1: address.name || address.street || address.district || prev.line1,
        city: address.city || address.subregion || prev.city,
        state: address.region || prev.state,
        pincode: address.postalCode || prev.pincode,
      }));
      Alert.alert('Success', 'Address fetched successfully!');
    } catch (err) {
      let msg = 'Failed to fetch location';
      let showSettings = false;

      if (err.message.includes('Location services are disabled')) {
        msg = 'Location services (GPS) are turned off. Please enable them in your device settings and try again.';
        showSettings = true;
      } else if (err.message.includes('permission denied')) {
        msg = 'Location permission was denied. Please allow location access in your settings.';
        showSettings = true;
      }

      Alert.alert(
        'Location Error',
        msg,
        showSettings
          ? [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          : [{ text: 'OK' }]
      );
    } finally {
      setFetchingLocation(false);
    }
  };

  const LABEL_OPTIONS = ['Home', 'Work', 'Other'];

  const renderAddress = ({ item }) => {
    const isDefault = item.id === defaultAddressId;
    return (
      <View style={[styles.addressCard, isDefault && styles.addressCardActive]}>
        <TouchableOpacity style={styles.addressCardInner} onPress={() => selectDefaultAddress(item.id)} activeOpacity={0.7}>
          <View style={styles.addressLeft}>
            <View style={[styles.labelBadge, isDefault && styles.labelBadgeActive]}>
              <MapPin size={12} color={isDefault ? COLORS.white : COLORS.gray[500]} />
              <Text style={[styles.labelText, isDefault && styles.labelTextActive]}>{item.label}</Text>
            </View>
            <Text style={styles.addrName}>{item.fullName}</Text>
            <Text style={styles.addrLine}>{formatAddress(item)}</Text>
            {item.phone ? <Text style={styles.addrPhone}>{item.phone}</Text> : null}
          </View>
          <View style={styles.addressRight}>
            {isDefault ? (
              <CheckCircle size={22} color={COLORS.primary} />
            ) : (
              <View style={styles.radioOuter}><View style={styles.radioInner} /></View>
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.addressActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
            <Edit3 size={16} color={COLORS.primary} />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item.id)}>
            <Trash2 size={16} color={COLORS.rose[500]} />
            <Text style={[styles.actionText, { color: COLORS.rose[500] }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={COLORS.foreground} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Plus size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {addresses.length === 0 ? (
        <View style={styles.emptyState}>
          <MapPin size={64} color={COLORS.gray[200]} />
          <Text style={styles.emptyTitle}>No Addresses Yet</Text>
          <Text style={styles.emptySubtitle}>Add your delivery address to get started.</Text>
          <TouchableOpacity style={styles.emptyAddBtn} onPress={openAdd}>
            <Plus size={18} color={COLORS.white} />
            <Text style={styles.emptyAddBtnText}>Add New Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={addresses}
          renderItem={renderAddress}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <TouchableOpacity style={styles.addMoreBtn} onPress={openAdd}>
              <Plus size={18} color={COLORS.primary} />
              <Text style={styles.addMoreText}>Add New Address</Text>
            </TouchableOpacity>
          }
        />
      )}

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit Address' : 'Add New Address'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={COLORS.foreground} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Auto Location Button */}
              <TouchableOpacity
                style={styles.autoLocationBtn}
                onPress={handleAutoLocation}
                disabled={fetchingLocation}
              >
                {fetchingLocation ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Navigation size={18} color={COLORS.primary} />
                )}
                <Text style={styles.autoLocationText}>
                  {fetchingLocation ? 'Fetching Location...' : 'Use Current Location'}
                </Text>
              </TouchableOpacity>
              {/* Label Selector */}
              <Text style={styles.fieldLabel}>Label</Text>
              <View style={styles.labelRow}>
                {LABEL_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.labelOption, form.label === opt && styles.labelOptionActive]}
                    onPress={() => setField('label', opt)}
                  >
                    <Text style={[styles.labelOptionText, form.label === opt && styles.labelOptionTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Full Name *</Text>
              <TextInput style={[styles.input, errors.fullName && styles.inputError]} placeholder="e.g. Riya Sharma" value={form.fullName} onChangeText={v => setField('fullName', v)} />
              {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}

              <Text style={styles.fieldLabel}>Phone *</Text>
              <TextInput style={[styles.input, errors.phone && styles.inputError]} placeholder="10-digit mobile number" value={form.phone} onChangeText={v => setField('phone', v)} keyboardType="phone-pad" maxLength={10} />
              {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}

              <Text style={styles.fieldLabel}>Address Line 1 *</Text>
              <TextInput style={[styles.input, errors.line1 && styles.inputError]} placeholder="House/Flat No, Street, Area" value={form.line1} onChangeText={v => setField('line1', v)} />
              {errors.line1 ? <Text style={styles.errorText}>{errors.line1}</Text> : null}

              <Text style={styles.fieldLabel}>Address Line 2</Text>
              <TextInput style={styles.input} placeholder="Landmark (optional)" value={form.line2} onChangeText={v => setField('line2', v)} />

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.fieldLabel}>City *</Text>
                  <TextInput style={[styles.input, errors.city && styles.inputError]} placeholder="City" value={form.city} onChangeText={v => setField('city', v)} />
                  {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Pincode *</Text>
                  <TextInput style={[styles.input, errors.pincode && styles.inputError]} placeholder="6-digit" value={form.pincode} onChangeText={v => setField('pincode', v)} keyboardType="numeric" maxLength={6} />
                  {errors.pincode ? <Text style={styles.errorText}>{errors.pincode}</Text> : null}
                </View>
              </View>

              <Text style={styles.fieldLabel}>State</Text>
              <TextInput style={styles.input} placeholder="State" value={form.state} onChangeText={v => setField('state', v)} />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>{editingId ? 'Update Address' : 'Save Address'}</Text>
              </TouchableOpacity>
              <View style={{ height: 32 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, height: 60,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.gray[50],
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.foreground },
  addBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  listContent: { padding: SPACING.md, paddingBottom: 40 },
  addressCard: {
    backgroundColor: COLORS.gray[50], borderRadius: 24, marginBottom: 16,
    borderWidth: 2, borderColor: 'transparent', overflow: 'hidden',
  },
  addressCardActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(92,97,242,0.04)' },
  addressCardInner: { flexDirection: 'row', padding: SPACING.md, alignItems: 'flex-start' },
  addressLeft: { flex: 1 },
  addressRight: { paddingLeft: 8, paddingTop: 4 },
  labelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.gray[200], paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, alignSelf: 'flex-start', marginBottom: 8,
  },
  labelBadgeActive: { backgroundColor: COLORS.primary },
  labelText: { fontSize: 11, fontWeight: '800', color: COLORS.gray[500], textTransform: 'uppercase' },
  labelTextActive: { color: COLORS.white },
  addrName: { fontSize: 15, fontWeight: '800', color: COLORS.foreground, marginBottom: 4 },
  addrLine: { fontSize: 13, color: COLORS.gray[500], lineHeight: 18, marginBottom: 4 },
  addrPhone: { fontSize: 12, color: COLORS.gray[400], fontWeight: '600' },
  radioOuter: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.gray[300],
    justifyContent: 'center', alignItems: 'center',
  },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.gray[200] },
  addressActions: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.gray[100],
    paddingHorizontal: SPACING.md,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12,
    marginRight: 24,
  },
  deleteBtn: {},
  actionText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  addMoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed',
    borderRadius: 20, paddingVertical: 16, marginTop: 8,
  },
  addMoreText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: COLORS.foreground, marginTop: 20, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.gray[400], textAlign: 'center', lineHeight: 20, marginBottom: 32 },
  emptyAddBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary,
    paddingHorizontal: 28, paddingVertical: 14, borderRadius: 20,
  },
  emptyAddBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: SPACING.lg, maxHeight: '90%',
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: COLORS.gray[200], borderRadius: 2,
    alignSelf: 'center', marginBottom: SPACING.md,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { fontSize: 22, fontWeight: '900', color: COLORS.foreground },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: COLORS.gray[500], marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: COLORS.gray[50], borderWidth: 1, borderColor: COLORS.gray[100],
    borderRadius: 14, paddingHorizontal: 16, height: 52, fontSize: 15, color: COLORS.foreground,
  },
  inputError: { borderColor: COLORS.rose[400] },
  errorText: { fontSize: 11, color: COLORS.rose[500], marginTop: 4, marginLeft: 4 },
  rowInputs: { flexDirection: 'row' },
  labelRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  labelOption: {
    flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: COLORS.gray[50],
    alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.gray[100],
  },
  labelOptionActive: { backgroundColor: 'rgba(92,97,242,0.1)', borderColor: COLORS.primary },
  labelOptionText: { fontSize: 14, fontWeight: '700', color: COLORS.gray[500] },
  labelOptionTextActive: { color: COLORS.primary },
  saveBtn: {
    backgroundColor: COLORS.primary, height: 56, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', marginTop: SPACING.lg,
  },
  saveBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '800' },
  autoLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(92,97,242,0.08)',
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(92,97,242,0.2)',
  },
  autoLocationText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
