import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../constants/typography';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function ReceiptModal({ visible, bill, onClose }) {
  const { colors: COLORS } = useTheme();

  const [prevCharges, setPrevCharges] = useState(0);

  useEffect(() => {
    if (visible && bill && bill.userId) {
      const fetchPrev = async () => {
        try {
          const q = query(collection(db, 'users', bill.userId, 'billing_emails'));
          const snap = await getDocs(q);
          const allBills = [];
          snap.forEach(d => {
             allBills.push({ id: d.id, ...d.data() });
          });
          
          allBills.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
          
          const currentIdx = allBills.findIndex(b => b.id === bill.id);
          if (currentIdx > 0) {
             const prevBill = allBills[currentIdx - 1];
             const pStatus = (prevBill.status || '').toLowerCase();
             if (pStatus !== 'paid') {
               setPrevCharges(parseFloat(prevBill.amount || 0));
             } else {
               setPrevCharges(0);
             }
          } else {
             setPrevCharges(0);
          }
        } catch(e) {
          console.warn('Could not fetch previous charges:', e);
        }
      };
      fetchPrev();
    }
  }, [visible, bill]);

  if (!bill) return null;

  const receiptDate = new Date(bill.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Header / Close */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Receipt Body (Paper style) */}
            <View style={styles.receiptPaper}>
              
              {/* Logo Area */}
              <View style={styles.logoArea}>
                <View style={styles.logoIcon}>
                  <Ionicons name="wifi" size={24} color="#FFF" />
                </View>
                <View>
                  <Text style={styles.brandText}>RFiber<Text style={{ color: '#E53935' }}>X</Text></Text>
                  <Text style={styles.brandSub}>INTERNET SERVICES</Text>
                </View>
              </View>

              {/* Title */}
              <View style={styles.titleArea}>
                <Text style={styles.titleText}>OFFICIAL RECEIPT</Text>
                <Text style={styles.dateText}>{receiptDate}</Text>
              </View>

              {/* Customer Info */}
              <View style={styles.infoGrid}>
                <View style={styles.infoColumn}>
                  <Text style={styles.infoLabel}>BILLED TO:</Text>
                  <Text style={styles.custName}>{bill.name || 'Unknown'}</Text>
                  <Text style={styles.custAddr}>{bill.address || 'Address N/A'}</Text>
                </View>
                <View style={styles.infoColumn}>
                  <Text style={styles.infoLabel}>ACCOUNT NO:</Text>
                  <Text style={styles.accNum}>{bill.accountNumber || bill.account || 'N/A'}</Text>
                  <Text style={styles.infoLabel}>BILL ID:</Text>
                  <Text style={styles.billIdText}>{bill.billId || bill.id?.substring(0, 8)}</Text>
                </View>
              </View>

              {/* Bill Details */}
              <View style={styles.detailsBox}>
                <Text style={styles.bsTitle}>BILL SUMMARY</Text>
                
                <View style={styles.chRow}>
                  <Text style={[styles.chLabel, { fontWeight: '700' }]}>A. Previous Charges</Text>
                  <Text style={styles.chVal}>₱{prevCharges.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                </View>
                <View style={[styles.chRow, { paddingLeft: 16 }]}>
                  <Text style={styles.chLabel}>Balance from Previous Bill</Text>
                  <Text style={styles.chVal}></Text>
                </View>
                
                <View style={[styles.chRow, { marginTop: 12, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 12 }]}>
                  <Text style={[styles.chLabel, { fontWeight: '700' }]}>B. Current Charges</Text>
                  <Text style={styles.chVal}></Text>
                </View>
                <View style={[styles.chRow, { paddingLeft: 16 }]}>
                  <Text style={styles.chLabel}>Internet Plan ({bill.plan || 'N/A'})</Text>
                  <Text style={styles.chVal}>₱{parseFloat(bill.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                </View>
                <View style={[styles.chRow, { paddingLeft: 16 }]}>
                  <Text style={styles.chLabel}>Billing Month</Text>
                  <Text style={styles.chVal}>{bill.billingMonth || '-'}</Text>
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>TOTAL AMOUNT DUE</Text>
                  <Text style={styles.totalVal}>₱{(parseFloat(bill.amount || 0) + prevCharges).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                </View>
              </View>

              {/* Status Footer */}
              <View style={styles.statusFooter}>
                <Text style={styles.statusLabel}>STATUS</Text>
                <Text style={[
                  styles.statusVal,
                  { color: bill.normalizedStatus === 'paid' ? '#10B981' : '#E53935' }
                ]}>
                  {bill.normalizedStatus === 'paid' ? 'PAID' : 'PENDING'}
                </Text>
              </View>

            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: SPACING.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptPaper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: SPACING.xl,
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: SPACING.xl,
  },
  logoIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#E53935',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
    letterSpacing: 1,
  },
  titleArea: {
    borderTopWidth: 2,
    borderTopColor: '#E53935',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  infoColumn: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '700',
    marginBottom: 4,
    marginTop: 8,
  },
  custName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    textTransform: 'uppercase',
  },
  custAddr: {
    fontSize: 11,
    color: '#666',
  },
  accNum: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
  },
  billIdText: {
    fontSize: 12,
    color: '#000',
  },
  detailsBox: {
    borderWidth: 1,
    borderColor: '#EEE',
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  bsTitle: {
    backgroundColor: '#111',
    color: '#FFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: SPACING.lg,
  },
  chRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  chLabel: {
    fontSize: 12,
    color: '#444',
  },
  chVal: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
  },
  totalRow: {
    backgroundColor: '#111',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  totalLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  totalVal: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  statusFooter: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  statusLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '700',
    marginBottom: 4,
  },
  statusVal: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
