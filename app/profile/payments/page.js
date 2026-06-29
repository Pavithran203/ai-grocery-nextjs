"use client";

import { 
  CreditCard, 
  Smartphone, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  CheckCircle2,
  Info,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function PaymentsPage() {
  const { t } = useTranslation();
  const [methods, setMethods] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    type: 'card', // 'card' or 'upi'
    label: '',
    cardNo: '',
    expiry: '',
    cvv: '',
    brand: 'Visa',
    handle: '',
    isDefault: false
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nearmart_payment_methods');
      if (stored) {
        setMethods(JSON.parse(stored));
      } else {
        // Seed default dummy data if nothing is saved
        const defaultData = [
          { id: '1', type: 'card', label: 'HDFC Credit Card', last4: '4321', expiry: '08/29', brand: 'Visa', isDefault: true },
          { id: '2', type: 'upi', label: 'Google Pay UPI', handle: 'user@okhdfcbank', isDefault: false }
        ];
        setMethods(defaultData);
        localStorage.setItem('nearmart_payment_methods', JSON.stringify(defaultData));
      }
    } catch (e) {
      setMethods([]);
    }
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    const newMethod = {
      id: Date.now().toString(),
      type: formData.type,
      label: formData.label || (formData.type === 'card' ? `${formData.brand} Card` : 'UPI ID'),
      isDefault: methods.length === 0 ? true : formData.isDefault,
    };

    if (formData.type === 'card') {
      // Extract last 4 digits
      const digits = formData.cardNo.replace(/\D/g, '');
      newMethod.last4 = digits.slice(-4) || '1111';
      newMethod.expiry = formData.expiry || '12/28';
      newMethod.brand = formData.brand || 'Visa';
    } else {
      newMethod.handle = formData.handle || 'user@upi';
    }

    let updated = [...methods];
    if (newMethod.isDefault) {
      updated = updated.map(m => ({ ...m, isDefault: false }));
    }
    updated.push(newMethod);
    setMethods(updated);
    localStorage.setItem('nearmart_payment_methods', JSON.stringify(updated));
    setIsAdding(false);
    
    // Reset Form
    setFormData({
      type: 'card',
      label: '',
      cardNo: '',
      expiry: '',
      cvv: '',
      brand: 'Visa',
      handle: '',
      isDefault: false
    });
  };

  const deleteMethod = (id) => {
    const updated = methods.filter(m => m.id !== id);
    const deletedWasDefault = methods.find(m => m.id === id)?.isDefault;
    if (deletedWasDefault && updated.length > 0) {
      updated[0].isDefault = true;
    }
    setMethods(updated);
    localStorage.setItem('nearmart_payment_methods', JSON.stringify(updated));
  };

  const setPrimary = (id) => {
    const updated = methods.map(m => ({
      ...m,
      isDefault: m.id === id
    }));
    setMethods(updated);
    localStorage.setItem('nearmart_payment_methods', JSON.stringify(updated));
  };

  const formatCardNo = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    const parts = [];
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.substring(i, i + 4));
    }
    return parts.join(' ');
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-1">{t('profile.payments.title')}</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{t('profile.payments.subtitle')}</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {t('profile.payments.addNew')}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-gray-900 rounded-[32px] border-2 border-emerald-500 shadow-xl p-8 relative animate-slideDown">
          <button 
            onClick={() => setIsAdding(false)}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <CreditCard className="w-5 h-5" />
            </div>
            {t('profile.payments.newMethod')}
          </h2>

          <form onSubmit={handleAdd} className="space-y-6">
            <div className="flex gap-3 mb-6">
              {['card', 'upi'].map(type => (
                <button 
                  key={type}
                  type="button"
                  onClick={() => setFormData({...formData, type})}
                  className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all cursor-pointer ${
                    formData.type === type 
                      ? 'bg-emerald-600 text-white border-emerald-600' 
                      : 'border-gray-100 dark:border-gray-800 text-gray-400 hover:border-emerald-200'
                  }`}
                >
                  {type === 'card' ? `💳 ${t('profile.payments.card')}` : `📱 ${t('profile.payments.upi')}`}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <input 
                className="checkout-input" 
                placeholder={t('profile.payments.label')} 
                value={formData.label || ''}
                onChange={e => setFormData({...formData, label: e.target.value})}
              />

              {formData.type === 'card' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      className="checkout-input md:col-span-2" 
                      placeholder={t('profile.payments.cardNo')} 
                      required
                      value={formData.cardNo || ''}
                      onChange={e => setFormData({...formData, cardNo: formatCardNo(e.target.value)})}
                    />
                    <input 
                      className="checkout-input" 
                      placeholder={t('profile.payments.expiry')} 
                      required
                      value={formData.expiry || ''}
                      onChange={e => setFormData({...formData, expiry: formatExpiry(e.target.value)})}
                    />
                    <input 
                      className="checkout-input" 
                      placeholder={t('profile.payments.cvv')} 
                      type="password"
                      maxLength={3}
                      required
                      value={formData.cvv || ''}
                      onChange={e => setFormData({...formData, cvv: e.target.value.replace(/\D/g, '')})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">{t('profile.payments.brand')}</label>
                    <select 
                      value={formData.brand} 
                      onChange={e => setFormData({...formData, brand: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all"
                    >
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="RuPay">RuPay</option>
                      <option value="Amex">Amex</option>
                    </select>
                  </div>
                </>
              ) : (
                <input 
                  className="checkout-input" 
                  placeholder={t('profile.payments.upiId')} 
                  required
                  value={formData.handle || ''}
                  onChange={e => setFormData({...formData, handle: e.target.value})}
                />
              )}
            </div>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded-lg border-2 border-gray-200 text-emerald-600 focus:ring-emerald-500"
                checked={formData.isDefault}
                onChange={e => setFormData({...formData, isDefault: e.target.checked})}
              />
              <span className="text-sm font-black text-gray-600 group-hover:text-emerald-600 transition-colors uppercase tracking-wider">{t('profile.payments.setAsPrimary')}</span>
            </label>

            <div className="pt-4">
              <button 
                type="submit"
                className="w-full bg-emerald-600 text-white py-5 rounded-[24px] font-black text-lg shadow-lg shadow-emerald-600/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                {t('profile.payments.saveMethod')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {methods.length > 0 ? (
          methods.map((method) => (
            <div key={method.id} className={`bg-white dark:bg-gray-900 rounded-[32px] border-2 transition-all p-6 relative overflow-hidden group ${
              method.isDefault ? 'border-emerald-500 shadow-md shadow-emerald-500/5' : 'border-gray-100 dark:border-gray-800 shadow-sm'
            }`}>
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-10 rounded-xl flex items-center justify-center border ${
                    method.isDefault ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-800 text-gray-400'
                  }`}>
                    {method.type === 'card' ? <CreditCard size={24} /> : <Smartphone size={24} />}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white uppercase text-xs tracking-widest">{method.label}</h3>
                    {method.isDefault && <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-1 block">{t('profile.payments.primary')}</span>}
                  </div>
                </div>
                <button 
                  onClick={() => deleteMethod(method.id)}
                  className="p-2 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl cursor-pointer"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {method.type === 'card' ? (
                <div className="space-y-1">
                  <p className="text-xl font-black text-gray-900 dark:text-white tracking-[0.3em]">•••• •••• •••• {method.last4}</p>
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Expires</p>
                      <p className="text-xs font-black text-gray-700 dark:text-gray-300">{method.expiry}</p>
                    </div>
                    <p className="text-xs font-black text-gray-400 uppercase italic">{method.brand}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-lg font-black text-emerald-600 tracking-tight">{method.handle}</p>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-4">Instant UPI Payment</p>
                </div>
              )}

              {!method.isDefault && (
                <button 
                  onClick={() => setPrimary(method.id)}
                  className="mt-6 w-full py-3 rounded-xl border border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-emerald-600 hover:border-emerald-200 transition-all cursor-pointer"
                >
                  {t('profile.payments.setAsPrimary')}
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="md:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-8 text-center shadow-sm">
            <p className="text-gray-400 font-bold text-sm">{t('profile.payments.noMethods')}</p>
            <p className="text-gray-400 text-xs mt-1">{t('profile.payments.noMethodsDesc')}</p>
          </div>
        )}

        {/* Info Card */}
        <div className="md:col-span-2 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-[32px] p-8 flex gap-6 items-start">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-blue-900 dark:text-blue-200 tracking-tight mb-2 flex items-center gap-2">
              {t('profile.payments.secureStorage')} <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </h3>
            <p className="text-sm font-medium text-blue-700/70 dark:text-blue-400/70 leading-relaxed max-w-2xl">
              {t('profile.payments.secureStorageDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
