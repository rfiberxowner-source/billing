import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, TextInput } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../constants/typography';
import { COLORS } from '../constants/colors';
import { collectionGroup, getDocs, doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import LoadingOverlay from '../components/LoadingOverlay';
import ReceiptModal from '../components/ReceiptModal';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function BillingScreen() {
  const { colors: themeColors } = useTheme();
  const styles = getStyles(themeColors);

  const [pendingBills, setPendingBills] = useState([]);
  const [paidBills, setPaidBills] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [selectedBill, setSelectedBill] = useState(null);
  const [receiptVisible, setReceiptVisible] = useState(false);

  const [pendingSearch, setPendingSearch] = useState('');
  const [paidSearch, setPaidSearch] = useState('');

  const loadBills = async () => {
    try {
      const userStr = await AsyncStorage.getItem('@rfiberx_user');
      if (userStr) setCurrentUser(JSON.parse(userStr));

      const billsSnap = await getDocs(collectionGroup(db, 'billing_emails'));
      let allPending = [];
      let allPaid = [];
      
      const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });

      billsSnap.forEach(docSnap => {
        const data = docSnap.data();
        let status = (data.status || 'Pending').toLowerCase();
        if (status === 'unread') status = 'pending';
        if (status === 'overdue') status = 'pending';

        const billObj = {
          id: docSnap.id,
          userId: docSnap.ref.parent.parent?.id,
          normalizedStatus: status,
          ...data,
        };

        const billMonth = String(data.billingMonth || data.month || data.period || '');
        const isCurrentMonth = billMonth.includes(currentMonth);

        if (status === 'pending') {
          allPending.push(billObj);
        } else if (status === 'paid' && isCurrentMonth) {
          allPaid.push(billObj);
        }
      });
      // Sort alphabetically by name
      allPending.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      allPaid.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      
      setPendingBills(allPending);
      setPaidBills(allPaid);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to fetch pending bills.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsFetching(true);
      loadBills().finally(() => setIsFetching(false));
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBills();
    setRefreshing(false);
  };

  const handleMarkPaid = (bill) => {
    Alert.alert(
      'Mark as Paid',
      `Are you sure you want to mark bill ${bill.billId || bill.id.substring(0,8)} for ${bill.name || 'Unknown'} as Paid?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Paid', 
          style: 'default',
          onPress: () => processPayment(bill)
        }
      ]
    );
  };

  const processPayment = async (bill) => {
    setIsFetching(true);
    try {
      if (!bill.userId) throw new Error('Missing User ID');
      
      // 1. Update status
      const billDocRef = doc(db, 'users', bill.userId, 'billing_emails', bill.id);
      await updateDoc(billDocRef, { status: 'paid' });

      // 2. Add to payments
      const now = new Date();
      await addDoc(collection(db, 'payments'), {
        userId: bill.userId,
        accountNumber: bill.accountNumber || bill.account || '',
        name: bill.name || '',
        amount: bill.amount || 0,
        plan: bill.plan || '',
        billingMonth: bill.billingMonth || '',
        dueDate: bill.dueDate || '',
        period: bill.billingMonth || bill.month || bill.period || '',
        method: 'Cash',
        paymentMethod: 'Cash',
        datePaid: now.toISOString(),
        status: 'Completed',
        processedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : 'Technician'
      });

      Alert.alert('Success', 'Bill marked as paid.');
      await loadBills();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to process payment.');
    } finally {
      setIsFetching(false);
    }
  };

  const displayedPending = pendingBills.filter(bill => {
    if (!pendingSearch) return true;
    const q = pendingSearch.toLowerCase();
    const name = (bill.name || 'Unknown').toLowerCase();
    return name.includes(q);
  });

  const displayedPaid = paidBills.filter(bill => {
    if (!paidSearch) return true;
    const q = paidSearch.toLowerCase();
    const name = (bill.name || 'Unknown').toLowerCase();
    return name.includes(q);
  });

  return (
    <>
    <LoadingOverlay visible={isFetching && !refreshing} message="Processing..." />
    <View style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.brandGreen} />} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Pending Bills</Text>
        
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={themeColors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customer name..."
            placeholderTextColor={themeColors.textMuted}
            value={pendingSearch}
            onChangeText={setPendingSearch}
          />
          {pendingSearch ? (
            <TouchableOpacity onPress={() => setPendingSearch('')}>
              <Ionicons name="close-circle" size={18} color={themeColors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.tableWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { width: 100 }]}>Bill ID</Text>
                <Text style={[styles.tableHeaderText, { width: 140 }]}>Customer</Text>
                <Text style={[styles.tableHeaderText, { width: 100 }]}>Month</Text>
                <Text style={[styles.tableHeaderText, { width: 100 }]}>Plan</Text>
                <Text style={[styles.tableHeaderText, { width: 80 }]}>Status</Text>
                <Text style={[styles.tableHeaderText, { width: 100, textAlign: 'center' }]}>Action</Text>
              </View>
              <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 270 }}>
                {displayedPending.length > 0 ? (
                  displayedPending.map((bill) => (
                    <TouchableOpacity 
                      key={bill.id} 
                      style={styles.tableRow}
                      onPress={() => {
                        setSelectedBill(bill);
                        setReceiptVisible(true);
                      }}
                    >
                      <Text style={[styles.tableCellText, { width: 100 }]} numberOfLines={1}>{bill.billId || bill.id.substring(0, 8)}</Text>
                      <Text style={[styles.tableCellText, { width: 140 }]} numberOfLines={1}>{bill.name || 'Unknown'}</Text>
                      <Text style={[styles.tableCellText, { width: 100 }]} numberOfLines={1}>{bill.billingMonth || '-'}</Text>
                      <Text style={[styles.tableCellText, { width: 100 }]} numberOfLines={1}>{bill.plan || '-'}</Text>
                      <View style={{ width: 80 }}>
                        <Text style={[styles.statusBadgeTextSmall, { color: themeColors.brandOrange }]}>
                          PENDING
                        </Text>
                      </View>
                      <View style={{ width: 100, alignItems: 'center' }}>
                        <TouchableOpacity 
                          style={styles.paidButton}
                          onPress={() => handleMarkPaid(bill)}
                        >
                          <Text style={styles.paidButtonText}>Paid</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={{ padding: SPACING.xl, alignItems: 'center', width: 620 }}>
                    <Text style={{ color: themeColors.textMuted }}>No pending bills right now.</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </ScrollView>
        </View>

        <Text style={[styles.headerTitle, { marginTop: SPACING.xxl }]}>Paid Bills (This Month)</Text>
        
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={themeColors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customer name..."
            placeholderTextColor={themeColors.textMuted}
            value={paidSearch}
            onChangeText={setPaidSearch}
          />
          {paidSearch ? (
            <TouchableOpacity onPress={() => setPaidSearch('')}>
              <Ionicons name="close-circle" size={18} color={themeColors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.tableWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { width: 100 }]}>Bill ID</Text>
                <Text style={[styles.tableHeaderText, { width: 140 }]}>Customer</Text>
                <Text style={[styles.tableHeaderText, { width: 100 }]}>Month</Text>
                <Text style={[styles.tableHeaderText, { width: 100 }]}>Plan</Text>
                <Text style={[styles.tableHeaderText, { width: 80 }]}>Status</Text>
              </View>
              <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 270 }}>
                {displayedPaid.length > 0 ? (
                  displayedPaid.map((bill) => (
                    <TouchableOpacity 
                      key={bill.id} 
                      style={styles.tableRow}
                      onPress={() => {
                        setSelectedBill(bill);
                        setReceiptVisible(true);
                      }}
                    >
                      <Text style={[styles.tableCellText, { width: 100 }]} numberOfLines={1}>{bill.billId || bill.id.substring(0, 8)}</Text>
                      <Text style={[styles.tableCellText, { width: 140 }]} numberOfLines={1}>{bill.name || 'Unknown'}</Text>
                      <Text style={[styles.tableCellText, { width: 100 }]} numberOfLines={1}>{bill.billingMonth || '-'}</Text>
                      <Text style={[styles.tableCellText, { width: 100 }]} numberOfLines={1}>{bill.plan || '-'}</Text>
                      <View style={{ width: 80 }}>
                        <Text style={[styles.statusBadgeTextSmall, { color: themeColors.brandGreen }]}>
                          PAID
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={{ padding: SPACING.xl, alignItems: 'center', width: 520 }}>
                    <Text style={{ color: themeColors.textMuted }}>No paid bills for this month yet.</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
    </View>
    <ReceiptModal 
      visible={receiptVisible} 
      bill={selectedBill} 
      onClose={() => setReceiptVisible(false)} 
    />
    </>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    padding: SPACING.xl,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 44,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    marginLeft: SPACING.sm,
    padding: 0,
  },
  tableWrapper: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  tableHeaderText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  tableCellText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.sm,
  },
  statusBadgeTextSmall: {
    fontSize: 10,
    fontWeight: FONTS.weights.bold,
  },
  paidButton: {
    backgroundColor: COLORS.brandGreen,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  paidButtonText: {
    color: COLORS.bgPrimary,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
});
