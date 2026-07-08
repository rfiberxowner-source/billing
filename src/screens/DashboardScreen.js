import React, { useState, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENT_BRAND, GRADIENT_ACCENT } from '../constants/colors';
import { FONTS, SPACING, RADIUS } from '../constants/typography';
import { getClients } from '../utils/storage';
import { useScrollToTop } from '../utils/hooks';
import LoadingOverlay from '../components/LoadingOverlay';
import ReceiptModal from '../components/ReceiptModal';

const { width } = Dimensions.get('window');

import { collection, getDocs, collectionGroup } from 'firebase/firestore';
import { db } from '../config/firebase';

const STAT_CARDS = [
  { id: 1, label: 'Total Clients', value: '0', icon: 'people', color: COLORS.brandGreen, gradient: ['#4AC29A', '#2ABCE8'] },
  { id: 2, label: 'Pending Bills', value: '0', icon: 'receipt', color: COLORS.brandOrange, gradient: ['#FF8008', '#FFC837'] },
];

const QUICK_ACTIONS = [
  { id: 1, label: 'Add Client', icon: 'person-add', screen: 'SelectPlan', description: 'Register a new network subscriber' },
  { id: 2, label: 'View Clients', icon: 'people', screen: 'Clients', description: 'Manage existing customers' },
];

export default function DashboardScreen({ navigation }) {
  const { colors: COLORS } = useTheme();
  const styles = getStyles(COLORS);

  const [totalClients, setTotalClients] = useState(0);
  const [pendingBills, setPendingBills] = useState(0);
  const [monthlyBills, setMonthlyBills] = useState([]);
  const [recentClients, setRecentClients] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  // Bill Filter & Receipt States
  const [billFilter, setBillFilter] = useState('All'); // 'All', 'Pending', 'Paid'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [receiptVisible, setReceiptVisible] = useState(false);

  const scrollRef = useScrollToTop();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('@rfiberx_user');
            navigation.replace('Auth');
          }
        }
      ]
    );
  };

  const displayedBills = monthlyBills.filter(bill => {
    // Overdue counts as pending for logic purposes
    let status = bill.normalizedStatus;
    if (status === 'overdue') status = 'pending';

    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
    const billMonth = String(bill.billingMonth || bill.month || bill.period || '');
    const isCurrentMonth = billMonth.includes(currentMonth);

    // Must follow core logic: Paid bills ONLY show if they are for the current month
    // Pending/Overdue bills show regardless of month
    if (status === 'paid' && !isCurrentMonth) {
      return false; 
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const customerName = (bill.name || 'Unknown').toLowerCase();
      if (!customerName.includes(q)) return false;
    }

    if (billFilter === 'All') return true;
    if (billFilter === 'Pending') return status === 'pending';
    if (billFilter === 'Paid') return status === 'paid';
    return true;
  });

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setIsFetching(true);
        try {
          // Fetch Total Clients from Firebase
          const usersSnap = await getDocs(collection(db, 'users'));
          setTotalClients(usersSnap.size);

          // Fetch Bills from Firebase
          const billsSnap = await getDocs(collectionGroup(db, 'billing_emails'));
          let pendingCount = 0;
          let allBills = [];
          billsSnap.forEach(doc => {
            const data = doc.data();
            let status = (data.status || 'Pending').toLowerCase();
            if (status === 'unread') status = 'pending';
            if (status === 'pending') pendingCount++;
            
            allBills.push({
              id: doc.id,
              userId: doc.ref.parent.parent?.id,
              ...data,
              normalizedStatus: status,
            });
          });
          
          // Sort bills alphabetically by name
          allBills.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          
          setPendingBills(pendingCount);
          setMonthlyBills(allBills);

          // Local recent activity (keeping as is for offline/processed tracking)
          const clients = await getClients();
          
          // Filter by last 7 days and sort descending
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          
          const recent = clients.filter(c => new Date(c.createdAt) >= oneWeekAgo);
          const sorted = recent.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setRecentClients(sorted);

          // Load current user
          const userStr = await AsyncStorage.getItem('@rfiberx_user');
          if (userStr) setCurrentUser(JSON.parse(userStr));
        } finally {
          setIsFetching(false);
        }
      };
      fetchData();
    }, [])
  );

  const currentUserName = currentUser ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : '';

  return (
    <>
      <LoadingOverlay visible={isFetching} message="Fetching client data..." />
      <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>Administrator</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        {STAT_CARDS.map((card) => (
          <View key={card.id} style={styles.statCardWrapper}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={card.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statIconBg}
              >
                <Ionicons name={card.icon} size={20} color={COLORS.bgPrimary} />
              </LinearGradient>
              <Text style={styles.statLabel}>{card.label}</Text>
              <Text style={styles.statValue}>
                {card.id === 1 ? totalClients : pendingBills}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsList}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionListItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(action.screen)}
          >
            <View style={styles.actionIconBg}>
              <Ionicons name={action.icon} size={24} color={COLORS.brandGreen} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionLabel}>{action.label}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Activity */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentClients.length > 0 && (
          <TouchableOpacity onPress={() => navigation.navigate('Clients', { filterByUser: currentUserName })}>
            <Text style={styles.viewAllText}>View my processed clients</Text>
          </TouchableOpacity>
        )}
      </View>

      {recentClients.length > 0 ? (
        <View style={styles.recentListWrapper}>
          <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
            {recentClients.map((client) => {
              const date = new Date(client.createdAt);
              const timeString = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
              return (
                <View key={client.id} style={styles.recentItem}>
                  <View style={styles.recentAvatar}>
                    <Text style={styles.recentAvatarText}>
                      {client.firstName[0]}{client.lastName[0]}
                    </Text>
                  </View>
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentName}>{client.firstName} {client.lastName}</Text>
                    <Text style={styles.recentPlan}>{client.plan} • {client.jobType}</Text>
                    {client.processedBy ? (
                      <Text style={styles.recentProcessedBy}>Processed by: {client.processedBy}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.recentTime}>{timeString}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No recent activity</Text>
          <Text style={styles.emptySubtext}>
            Start by adding your first client
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('SelectPlan')}
          >
            <LinearGradient
              colors={GRADIENT_ACCENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.emptyButtonGradient}
            >
              <Ionicons name="add" size={18} color={COLORS.bgPrimary} />
              <Text style={styles.emptyButtonText}>Add Client</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
      {/* Bills Summary Section */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.lg, marginBottom: SPACING.md }}>
        <Text style={[styles.sectionTitle, { marginBottom: 0, marginTop: 0 }]}>Bills Overview</Text>
        <View style={styles.filterRow}>
          {['All', 'Pending', 'Paid'].map(filter => (
            <TouchableOpacity 
              key={filter} 
              onPress={() => setBillFilter(filter)}
              style={[styles.filterBadge, billFilter === filter && styles.filterBadgeActive]}
            >
              <Text style={[styles.filterBadgeText, billFilter === filter && styles.filterBadgeTextActive]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={[styles.searchBar, { marginBottom: SPACING.md, marginTop: 0 }]}>
        <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search customer name..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.billsWrapper}>
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
              {displayedBills.length > 0 ? (
                displayedBills.map((bill) => (
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
                      <Text style={[
                        styles.statusBadgeTextSmall,
                        { color: bill.normalizedStatus === 'paid' ? COLORS.brandGreen : COLORS.brandOrange }
                      ]}>
                        {bill.normalizedStatus.toUpperCase()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={{ padding: SPACING.lg, alignItems: 'center', width: 520 }}>
                  <Text style={{ color: COLORS.textMuted }}>No bills found for the selected filter.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </ScrollView>
    <ReceiptModal 
      visible={receiptVisible} 
      bill={selectedBill} 
      onClose={() => setReceiptVisible(false)} 
    />
    </>
  );
}

const cardWidth = (width - SPACING.xl * 2 - SPACING.md) / 2;

const getStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  contentContainer: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  welcomeSection: {
    marginBottom: SPACING.xxl,
  },
  welcomeText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.lg,
  },
  userName: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.xxxl,
    fontWeight: FONTS.weights.bold,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.xxl,
  },
  statCardWrapper: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  statCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    marginTop: 4,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    marginBottom: SPACING.lg,
  },
  actionsList: {
    marginBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  actionListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(74, 194, 154, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionLabel: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
  },
  actionDescription: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
  },
  emptyState: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderStyle: 'dashed',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: SPACING.xl,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: RADIUS.md,
  },
  emptyButtonText: {
    color: COLORS.bgPrimary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    marginLeft: SPACING.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  viewAllText: {
    color: COLORS.brandGreen,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
  },
  recentListWrapper: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    maxHeight: 400,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  recentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 194, 154, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  recentAvatarText: {
    color: COLORS.brandGreen,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
  },
  recentPlan: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
  },
  recentProcessedBy: {
    color: COLORS.brandTeal,
    fontSize: FONTS.sizes.xs,
    marginTop: 2,
    fontStyle: 'italic',
  },
  recentTime: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    marginLeft: SPACING.sm,
    padding: 0,
  },
  billsWrapper: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    marginBottom: SPACING.md,
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    backgroundColor: 'transparent',
  },
  filterBadgeActive: {
    backgroundColor: COLORS.brandGreen,
    borderColor: COLORS.brandGreen,
  },
  filterBadgeText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: FONTS.weights.bold,
  },
  filterBadgeTextActive: {
    color: COLORS.bgPrimary,
  },
});
