"use client";
import React, { useState, useEffect } from "react";
import {
  X, Navigation, Loader2, ArrowRight, Home,
  Building2, MapPin, ChevronRight, LocateFixed,
  Plus, Edit3, Trash2, CheckCircle, Phone, User,
  ArrowLeft, Map as MapIcon, ShieldCheck
} from "lucide-react";
import { useAddress } from "@/context/AddressContext";
import { useLocation } from "@/context/LocationContext";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(() => import("./InteractiveMap"), {
  ssr: false,
  loading: () => {
    const { t } = useTranslation();
    return (
      <div className="loc-map-loader">
        <MapIcon className="loc-map-loader-icon" />
        <p className="loc-map-loader-text">{t('location.loadingMap', 'Loading Map...')}</p>
      </div>
    );
  }
});

/* ═══════════════════════════════════════
   EMPTY FORM TEMPLATE (matches mobile)
   ═══════════════════════════════════════ */
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

const LABEL_OPTIONS = [
  { id: 'Home', icon: Home },
  { id: 'Work', icon: Building2 },
  { id: 'Other', icon: MapPin },
];

/* ═══════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════ */
const FormField = ({ label, value, onChange, placeholder, error, icon: Icon, type = 'text', maxLength, action }) => (
  <div className="loc-field">
    <label className="loc-field-label">{label}</label>
    <div className="loc-field-input-wrap">
      {Icon && <Icon size={16} className="loc-field-icon" />}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`loc-field-input ${Icon ? 'has-icon' : ''} ${error ? 'has-error' : ''} ${action ? 'has-action' : ''}`}
      />
      {action && (
        <div className="loc-field-action-wrap">
          {action}
        </div>
      )}
    </div>
    {error && <p className="loc-field-error">{error}</p>}
  </div>
);

const LabelSelector = ({ value, onChange, t }) => (
  <div className="loc-label-selector">
    <label className="loc-field-label" style={{ textAlign: 'center', display: 'block' }}>{t('location.saveAs', 'Save As')}</label>
    <div className="loc-label-row">
      {[
        { id: 'Home', label: t('location.home', 'Home'), icon: Home },
        { id: 'Work', label: t('location.work', 'Work'), icon: Building2 },
        { id: 'Other', label: t('location.other', 'Other'), icon: MapPin },
      ].map(opt => {
        const IconComp = opt.icon;
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`loc-label-btn ${active ? 'active' : ''}`}
          >
            <IconComp size={16} />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  </div>
);

const AddressCard = ({ addr, isDefault, onSelect, onEdit, onDelete, t }) => (
  <div className={`loc-addr-card ${isDefault ? 'is-default' : ''}`}>
    <button className="loc-addr-card-inner" onClick={() => onSelect(addr.id)}>
      <div className="loc-addr-left">
        <div className={`loc-addr-badge ${isDefault ? 'active' : ''}`}>
          <MapPin size={12} />
          <span>{addr.label === 'Home' ? t('location.home', 'Home') : addr.label === 'Work' ? t('location.work', 'Work') : t('location.other', 'Other')}</span>
        </div>
        {addr.fullName && <p className="loc-addr-name">{addr.fullName}</p>}
        <p className="loc-addr-line">
          {[addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
        </p>
        {addr.phone && <p className="loc-addr-phone">{addr.phone}</p>}
      </div>
      <div className="loc-addr-right">
        {isDefault ? (
          <CheckCircle size={22} className="loc-addr-check" />
        ) : (
          <div className="loc-addr-radio"><div className="loc-addr-radio-inner" /></div>
        )}
      </div>
    </button>
    <div className="loc-addr-actions">
      <button className="loc-addr-action-btn" onClick={() => onEdit(addr)}>
        <Edit3 size={14} /> {t('location.edit', 'Edit')}
      </button>
      <button className="loc-addr-action-btn delete" onClick={() => onDelete(addr.id)}>
        <Trash2 size={14} /> {t('location.delete', 'Delete')}
      </button>
    </div>
  </div>
);

/* ═══════════════════════════════════════
   MAIN LOCATION MODAL
   ═══════════════════════════════════════ */
export default function LocationModal() {
  const {
    isLocationModalOpen: isOpen,
    setLocationModalOpen,
    getCurrentAddress,
    reverseGeocodeCoords,
    setLocationText,
    loading: locationLoading,
  } = useLocation();

  const {
    addresses,
    defaultAddressId,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
    formatAddress,
  } = useAddress();

  const { isAuthenticated, setLoginModalOpen, loginWithOtp } = useAuth();
  const { t } = useTranslation();

  // Steps: 'menu' | 'map' | 'form' | 'otp'
  const [step, setStep] = useState('menu');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [saving, setSaving] = useState(false);

  // OTP specific state for inline verification
  const [otp, setOtp] = useState('');
  const [pendingAddress, setPendingAddress] = useState(null);
  const [otpError, setOtpError] = useState('');
  const [inlineOtp, setInlineOtp] = useState('');
  const [showInlineOtp, setShowInlineOtp] = useState(false);
  const [inlineOtpError, setInlineOtpError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('menu');
      setEditingId(null);
      setForm(EMPTY_FORM);
      setErrors({});
      setFetchingLocation(false);
      setDeleteConfirmId(null);
      setSaving(false);
      setOtp('');
      setPendingAddress(null);
      setOtpError('');
      setInlineOtp('');
      setShowInlineOtp(false);
      setInlineOtpError('');
    }
  }, [isOpen]);

  const onClose = () => setLocationModalOpen(false);

  /* ── Form helpers ── */
  const setField = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = t('location.nameRequired', 'Name is required');
    if (!form.phone.trim()) e.phone = t('location.phoneRequired', 'Phone is required');
    if (!form.line1.trim()) e.line1 = t('location.addressRequired', 'Address line is required');
    if (!form.city.trim()) e.city = t('location.cityRequired', 'City is required');
    if (!form.pincode.trim()) e.pincode = t('location.pincodeRequired', 'Pincode is required');
    return e;
  };

  const handleVerifyPhoneClick = () => {
    if (!form.phone.trim()) {
      setErrors({ phone: t('location.phoneRequired', 'Phone is required') });
      return;
    }
    if (form.phone.trim().length !== 10) {
      setErrors({ phone: t('auth.invalidPhone', 'Please enter a valid 10-digit phone number') });
      return;
    }
    
    setShowInlineOtp(true);
    setInlineOtp('');
    setInlineOtpError('');
  };

  const handleInlineOtpVerify = async () => {
    if (!inlineOtp || inlineOtp.length < 4) {
      setInlineOtpError(t('auth.invalidOtp', 'Invalid OTP. Use 1234 for testing.'));
      return;
    }
    if (inlineOtp === '1234' || inlineOtp === '0000') {
      setSaving(true);
      setInlineOtpError('');
      try {
        const result = await loginWithOtp(form.phone, inlineOtp, form.fullName || 'Valued Customer');
        if (result.success) {
          setSaving(false);
          setShowInlineOtp(false);
          setInlineOtp('');
          if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
        } else {
          setSaving(false);
          setInlineOtpError(result.message || 'Verification failed');
        }
      } catch (err) {
        setSaving(false);
        setInlineOtpError(err.message || 'Verification failed');
      }
    } else {
      setInlineOtpError(t('auth.invalidOtp', 'Invalid OTP. Use 1234 for testing.'));
    }
  };

  /* ── Actions ── */
  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setStep('form');
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
    setStep('form');
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
 
    if (!isAuthenticated) {
      setShowInlineOtp(true);
      setInlineOtpError(t('auth.verifyPhoneFirst', 'Please verify your phone number via OTP to save this address'));
      return;
    }
 
    setSaving(true);
    if (editingId) {
      updateAddress(editingId, form);
    } else {
      addAddress(form);
    }
 
    // Update location text from the saved address
    const text = [form.city, form.state].filter(Boolean).join(', ');
    if (text) setLocationText(text);

    setTimeout(() => {
      setSaving(false);
      onClose();
    }, 300);
  };

  const handleOtpVerify = async () => {
    if (!otp || otp.length < 4) {
      setOtpError(t('auth.invalidOtp', 'Invalid OTP. Use 1234 for testing.'));
      return;
    }
    if (otp === '1234' || otp === '0000') {
      setSaving(true);
      setOtpError('');
      try {
        const result = await loginWithOtp(pendingAddress.phone, otp, pendingAddress.fullName || 'Valued Customer');
        if (result.success) {
          // Check if the address was fully entered or if it was just an inline verification
          if (!pendingAddress.fullName.trim() || !pendingAddress.line1.trim() || !pendingAddress.city.trim() || !pendingAddress.pincode.trim()) {
            // Not a complete address, so just return to the form now that we are authenticated!
            setSaving(false);
            setStep('form');
            return;
          }

          // Add address under the newly logged in user
          await addAddress(pendingAddress);

          // Update location text
          const text = [pendingAddress.city, pendingAddress.state].filter(Boolean).join(', ');
          if (text) setLocationText(text);

          setTimeout(() => {
            setSaving(false);
            onClose();
          }, 300);
        } else {
          setSaving(false);
          setOtpError(result.message || 'Verification failed');
        }
      } catch (err) {
        setSaving(false);
        setOtpError(err.message || 'Verification failed');
      }
    } else {
      setOtpError(t('auth.invalidOtp', 'Invalid OTP. Use 1234 for testing.'));
    }
  };

  const handleDelete = (id) => {
    removeAddress(id);
  };

  const handleSelectDefault = (id) => {
    setDefaultAddress(id);
    const addr = addresses.find(a => a.id === id);
    if (addr) {
      const text = [addr.city, addr.state].filter(Boolean).join(', ');
      if (text) setLocationText(text);
    }
  };

  /* ── GPS Auto-fill (matching mobile handleAutoLocation) ── */
  const handleAutoLocation = async () => {
    setFetchingLocation(true);
    try {
      const address = await getCurrentAddress();
      setForm(prev => ({
        ...prev,
        line1: address.road || address.suburb || address.neighbourhood || prev.line1,
        city: address.city || address.town || address.village || prev.city,
        state: address.state || prev.state,
        pincode: address.postcode || prev.pincode,
      }));
      setStep('form');
    } catch (err) {
      let msg = t('location.failedToFetch', 'Failed to fetch location.');
      if (err.message.includes('permission denied') || err.message.includes('Permission')) {
        msg = t('location.permissionDenied', 'Location permission was denied. Please allow location access in your browser settings.');
      } else if (err.message.includes('disabled') || err.message.includes('unavailable')) {
        msg = t('location.servicesUnavailable', 'Location services are unavailable. Please enable GPS/location in your device settings.');
      }
      alert(msg);
    } finally {
      setFetchingLocation(false);
    }
  };

  /* ── Map confirm → reverse geocode → prefill form ── */
  const handleMapConfirm = async (position) => {
    setFetchingLocation(true);
    try {
      const addr = await reverseGeocodeCoords(position.lat, position.lng);
      setForm(prev => ({
        ...prev,
        line1: addr.road || prev.line1,
        city: addr.city || prev.city,
        state: addr.state || prev.state,
        pincode: addr.postcode || prev.pincode,
      }));
      setStep('form');
    } catch (err) {
      console.error('Reverse geocode error:', err);
      setStep('form');
    } finally {
      setFetchingLocation(false);
    }
  };

  if (!isOpen) return null;

  const stepTitle = step === 'form'
    ? (editingId ? t('location.editAddress') : t('location.newAddress'))
    : step === 'map' ? t('location.pickLocation')
    : t('location.deliveryLocation');

  const stepSubtitle = step === 'form'
    ? t('location.enterDeliveryDetails')
    : step === 'map' ? t('location.tapMapToPlacePin')
    : t('location.selectDeliveryArea');

  return (
    <div className="loc-overlay" onClick={onClose}>
      <div className="loc-modal animate-slideUp" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="loc-header">
          <div className="loc-header-left">
            {step !== 'menu' && (
              <button
                className="loc-back-btn"
                onClick={() => setStep('menu')}
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="loc-title">{stepTitle}</h2>
              <p className="loc-subtitle">{stepSubtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="loc-close-btn">
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="loc-body no-scrollbar">

          {/* ═══ STEP: MENU ═══ */}
          {step === 'menu' && (
            <div className="loc-step animate-fadeIn">
              {/* GPS Button */}
              <button
                className="loc-action-card gps"
                onClick={handleAutoLocation}
                disabled={fetchingLocation}
              >
                <div className="loc-action-icon-wrap gps">
                  {fetchingLocation
                    ? <Loader2 size={18} className="animate-spin" />
                    : <LocateFixed size={18} />
                  }
                </div>
                <div className="loc-action-text">
                  <p className="loc-action-title">{t('location.currentLocation')}</p>
                  <p className="loc-action-sub">
                    {fetchingLocation ? t('common.detecting') : t('location.detectViaGps')}
                  </p>
                </div>
                <ChevronRight size={16} className="loc-action-arrow" />
              </button>

              {/* Map Button */}
              <button className="loc-action-card map" onClick={() => setStep('map')}>
                <div className="loc-action-icon-wrap map">
                  <MapPin size={18} />
                </div>
                <div className="loc-action-text">
                  <p className="loc-action-title dark">{t('location.manualSelection')}</p>
                  <p className="loc-action-sub">{t('location.pickOnMap')}</p>
                </div>
                <ArrowRight size={16} className="loc-action-arrow" />
              </button>

              {/* Login Prompt for Guests */}
              {!isAuthenticated && (
                <button 
                  type="button" 
                  onClick={() => {
                    onClose();
                    setLoginModalOpen(true);
                  }}
                  className="loc-login-prompt"
                >
                  <User size={16} className="text-emerald-600 shrink-0" />
                  <div className="loc-login-prompt-text">
                    <p className="loc-login-prompt-title">{t('auth.loginToSeeSavedAddresses', 'Login to see saved addresses')}</p>
                    <p className="loc-login-prompt-sub">{t('auth.loginToSeeSavedAddressesSub', 'Access your saved home, work, and other addresses')}</p>
                  </div>
                  <ChevronRight size={14} className="loc-login-prompt-arrow" />
                </button>
              )}

              {/* Divider */}
              {addresses.length > 0 && (
                <div className="loc-divider">
                  <div className="loc-divider-line" />
                  <span className="loc-divider-text">{t('location.savedAddresses')}</span>
                  <div className="loc-divider-line" />
                </div>
              )}

              {/* Saved Addresses */}
              {addresses.length > 0 ? (
                <div className="loc-addr-list">
                  {addresses.map(addr => (
                    <AddressCard
                      key={addr.id}
                      addr={addr}
                      isDefault={addr.id === defaultAddressId}
                      onSelect={handleSelectDefault}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      t={t}
                    />
                  ))}
                </div>
              ) : (
                <div className="loc-empty">
                  <MapPin size={40} className="loc-empty-icon" />
                  <p className="loc-empty-title">{t('location.noSavedAddresses')}</p>
                  <p className="loc-empty-sub">{t('location.addDeliveryToGetStarted')}</p>
                </div>
              )}

              {/* Add New Button */}
              <button className="loc-add-btn" onClick={openAdd}>
                <Plus size={16} />
                <span>{t('location.addNewAddress')}</span>
              </button>
            </div>
          )}

          {/* ═══ STEP: MAP ═══ */}
          {step === 'map' && (
            <div className="loc-step animate-fadeIn">
              <div className="loc-map-wrap">
                <InteractiveMap
                  onConfirm={handleMapConfirm}
                  onCancel={() => setStep('menu')}
                />
              </div>
            </div>
          )}

          {/* ═══ STEP: FORM ═══ */}
          {step === 'form' && (
            <div className="loc-step animate-fadeIn">
              {/* Auto-fill GPS Button */}
              <button
                className="loc-autofill-btn"
                onClick={handleAutoLocation}
                disabled={fetchingLocation}
              >
                {fetchingLocation
                  ? <Loader2 size={16} className="animate-spin" />
                  : <Navigation size={16} />
                }
                <span>{fetchingLocation ? t('common.detecting') : t('location.useCurrentLocation')}</span>
              </button>

              {/* Label Selector */}
              <LabelSelector value={form.label} onChange={(val) => setField('label', val)} t={t} />

              {/* Form Fields (matching mobile AddressScreen) */}
              <FormField
                label={t('checkout.fullName')}
                value={form.fullName}
                onChange={(val) => setField('fullName', val)}
                placeholder={t('checkout.namePlaceholder')}
                error={errors.fullName}
                icon={User}
              />
              <FormField
                label={t('checkout.phone')}
                value={form.phone}
                onChange={(val) => setField('phone', val.replace(/\D/g, ''))}
                placeholder={t('checkout.phonePlaceholder', '10-digit mobile number')}
                error={errors.phone}
                icon={Phone}
                type="tel"
                maxLength={10}
                action={!isAuthenticated && form.phone.length === 10 ? (
                  <button
                    type="button"
                    onClick={handleVerifyPhoneClick}
                    className="loc-field-action-btn"
                  >
                    Verify & Login
                  </button>
                ) : isAuthenticated ? (
                  <span className="text-emerald-600 font-bold text-xs flex items-center gap-1 mr-3">
                    <CheckCircle size={14} className="fill-emerald-100 dark:fill-emerald-950" /> Verified
                  </span>
                ) : null}
              />
              {showInlineOtp && !isAuthenticated && (
                <div className="animate-fadeIn">
                  <FormField
                    label={t('auth.otpCodePlaceholder', 'OTP Code')}
                    value={inlineOtp}
                    onChange={(val) => {
                      setInlineOtp(val.replace(/\D/g, '').slice(0, 4));
                      if (inlineOtpError) setInlineOtpError('');
                    }}
                    placeholder="Enter 4-digit code (e.g. 1234)"
                    error={inlineOtpError}
                    icon={ShieldCheck}
                    type="text"
                    maxLength={4}
                    action={inlineOtp.length === 4 ? (
                      <button
                        type="button"
                        onClick={handleInlineOtpVerify}
                        className="loc-field-action-btn"
                        disabled={saving}
                      >
                        {saving ? 'Verifying...' : 'Verify'}
                      </button>
                    ) : null}
                  />
                  <p className="text-right mr-2 mt-1 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    Use 1234 or 0000 for testing
                  </p>
                </div>
              )}
              <FormField
                label={t('location.houseFlatBlock')}
                value={form.line1}
                onChange={(val) => setField('line1', val)}
                placeholder={t('location.housePlaceholder', 'e.g. Flat 402, Block C')}
                error={errors.line1}
                icon={Home}
              />
              <FormField
                label={t('location.streetRoad')}
                value={form.line2}
                onChange={(val) => setField('line2', val)}
                placeholder={t('location.streetPlaceholder', 'Landmark (optional)')}
                icon={Navigation}
              />

              {/* City + Pincode Row */}
              <div className="loc-row">
                <FormField
                  label={t('location.cityLabel', 'City *')}
                  value={form.city}
                  onChange={(val) => setField('city', val)}
                  placeholder={t('location.cityPlaceholder', 'City')}
                  error={errors.city}
                />
                <FormField
                  label={t('checkout.pincode')}
                  value={form.pincode}
                  onChange={(val) => setField('pincode', val.replace(/\D/g, ''))}
                  placeholder={t('checkout.pincodePlaceholder', '6-digit')}
                  error={errors.pincode}
                  maxLength={6}
                />
              </div>

              <FormField
                label={t('location.state')}
                value={form.state}
                onChange={(val) => setField('state', val)}
                placeholder={t('location.statePlaceholder', 'State')}
              />

              {/* Pick on Map shortcut */}
              <button className="loc-map-shortcut" onClick={() => setStep('map')}>
                <MapIcon size={16} />
                <span>{t('location.pickOnMap')}</span>
                <ArrowRight size={14} />
              </button>

              {/* Save Button */}
              <button
                className="loc-save-btn gradient-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <><Loader2 size={16} className="animate-spin" /> {t('common.processing')}</>
                ) : (
                  <>{editingId ? t('location.updateAddress') : t('location.saveAddress')} <ArrowRight size={16} /></>
                )}
              </button>

              {step === 'form' && (
                <button className="loc-change-btn" onClick={() => setStep('menu')}>
                  ← {t('location.backToAddresses')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
