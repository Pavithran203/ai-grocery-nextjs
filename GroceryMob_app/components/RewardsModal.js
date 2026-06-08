import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { X } from 'lucide-react-native';
import { COLORS, SPACING } from '../services/theme';
import { useLoyalty } from '../context/LoyaltyContext';

export default function RewardsModal({ visible, onClose }) {
  const { coins, history } = useLoyalty();

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>My Rewards</Text>
              <Text style={styles.rewardSub}>Earned {coins} Gold Coins</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={COLORS.foreground} />
            </TouchableOpacity>
          </View>

          <View style={styles.coinCardBig}>
            <Text style={styles.coinValueBig}>🟡 {coins}</Text>
            <Text style={styles.coinLabelBig}>Available Balance</Text>
            <View style={styles.rewardOfferBadge}>
              <Text style={styles.rewardOfferText}>✨ After getting 100 coins you will get 10% discount!</Text>
            </View>
          </View>

          <Text style={styles.historyTitle}>Rewards History</Text>
          
          {history.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistoryText}>No transactions yet.</Text>
              <Text style={styles.emptyHistorySub}>Place orders to earn gold coins!</Text>
            </View>
          ) : (
            <FlatList 
              data={history}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.historyItem}>
                  <View style={styles.historyIcon}>
                    <Text style={{ fontSize: 18 }}>{item.type === 'earn' ? '📈' : '📉'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyDesc}>{item.desc}</Text>
                    <Text style={styles.historyDate}>{new Date(item.date).toLocaleDateString()}</Text>
                  </View>
                  <Text style={[styles.historyAmount, { color: item.type === 'earn' ? COLORS.emerald[600] : COLORS.rose[500] }]}>
                    {item.type === 'earn' ? '+' : '-'}{item.amount}
                  </Text>
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: SPACING.xl,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.foreground,
  },
  rewardSub: {
    fontSize: 14,
    color: COLORS.gray[400],
    fontWeight: '600',
    marginTop: 2,
  },
  coinCardBig: {
    backgroundColor: '#FFFBEB',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  coinValueBig: {
    fontSize: 42,
    fontWeight: '900',
    color: '#D97706',
  },
  coinLabelBig: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F59E0B',
    marginTop: 4,
  },
  rewardOfferBadge: {
    marginTop: 16,
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.2)',
  },
  rewardOfferText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
    textAlign: 'center',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.foreground,
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyDesc: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  historyDate: {
    fontSize: 12,
    color: COLORS.gray[400],
    marginTop: 2,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyHistory: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  emptyHistoryText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray[400],
  },
  emptyHistorySub: {
    fontSize: 14,
    color: COLORS.gray[300],
    marginTop: 4,
  },
});
