import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { X, Filter, ChevronDown } from 'lucide-react-native';
import { COLORS, SPACING } from '../../services/theme';
import { useLanguage } from '../../context/LanguageContext';

const FILTER_OPTIONS = [
  { id: 'free_delivery', label: 'Free Delivery', icon: '🚚' },
  { id: 'pickup_only', label: 'Pickup Only', icon: '🛍️' },
  { id: 'delivery_available', label: 'Delivery Available', icon: '📦' },
  { id: 'long_distance', label: 'Long Distance (>20km)', icon: '🛣️' },
  { id: 'fast_delivery', label: 'Fast Delivery (<30m)', icon: '⚡' },
  { id: 'open_now', label: 'Open Now', icon: '🕒' },
  { id: 'top_rated_store', label: 'Top Rated Stores', icon: '⭐' },
];

const StoreFilters = ({ activeFilters, onFilterChange, onClearAll, showModal, setShowModal }) => {
  const { t } = useLanguage();

  const toggleFilter = (id) => {
    if (activeFilters.includes(id)) {
      onFilterChange(activeFilters.filter(f => f !== id));
    } else {
      onFilterChange([...activeFilters, id]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.chipScroll}
      >
        <TouchableOpacity 
          style={[styles.filterBtn, activeFilters.length > 0 && styles.filterBtnActive]} 
          onPress={() => setShowModal(true)}
        >
          <Filter size={14} color={activeFilters.length > 0 ? '#fff' : COLORS.gray[500]} />
          <Text style={[styles.filterBtnText, activeFilters.length > 0 && { color: '#fff' }]}>
            {t('Filters')} {activeFilters.length > 0 ? `(${activeFilters.length})` : ''}
          </Text>
          <ChevronDown size={14} color={activeFilters.length > 0 ? '#fff' : COLORS.gray[400]} />
        </TouchableOpacity>

        {FILTER_OPTIONS.map(opt => {
          const isActive = activeFilters.includes(opt.id);
          return (
            <TouchableOpacity 
              key={opt.id}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => toggleFilter(opt.id)}
            >
              <Text style={styles.chipEmoji}>{opt.icon}</Text>
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{t(opt.label)}</Text>
              {isActive && (
                <View style={styles.chipX}>
                  <X size={10} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('Sort & Filter')}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X size={24} color={COLORS.foreground} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.sectionTitle}>{t('Delivery Preferences')}</Text>
              <View style={styles.filterGrid}>
                {FILTER_OPTIONS.map(opt => {
                  const isActive = activeFilters.includes(opt.id);
                  return (
                    <TouchableOpacity 
                      key={opt.id}
                      style={[styles.gridItem, isActive && styles.gridItemActive]}
                      onPress={() => toggleFilter(opt.id)}
                    >
                      <Text style={styles.gridEmoji}>{opt.icon}</Text>
                      <Text style={[styles.gridLabel, isActive && styles.gridLabelActive]}>{t(opt.label)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.resetBtn} onPress={onClearAll}>
                <Text style={styles.resetBtnText}>{t('Clear All')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.applyBtnText}>{t('Apply')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  chipScroll: { paddingHorizontal: SPACING.md, gap: 8, alignItems: 'center' },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.gray[200] },
  filterBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.gray[600] },
  
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.gray[200] },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipEmoji: { fontSize: 14 },
  chipText: { fontSize: 12, fontWeight: '600', color: COLORS.gray[600] },
  chipTextActive: { color: '#fff' },
  chipX: { marginLeft: 4, width: 14, height: 14, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.gray[50] },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.foreground },
  modalBody: { padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.gray[400], marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
  
  filterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '47%', backgroundColor: COLORS.gray[50], padding: 16, borderRadius: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'transparent' },
  gridItemActive: { backgroundColor: '#F0FFF4', borderColor: COLORS.emerald[200] },
  gridEmoji: { fontSize: 24 },
  gridLabel: { fontSize: 13, fontWeight: '700', color: COLORS.gray[600], textAlign: 'center' },
  gridLabelActive: { color: COLORS.emerald[700] },

  modalFooter: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: COLORS.gray[50] },
  resetBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: COLORS.gray[200] },
  resetBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.gray[600] },
  applyBtn: { flex: 2, backgroundColor: COLORS.primary, paddingVertical: 14, alignItems: 'center', borderRadius: 16 },
  applyBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});

export default StoreFilters;
