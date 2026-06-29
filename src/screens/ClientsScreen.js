import React, { useState, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENT_ACCENT, GRADIENT_BRAND } from '../constants/colors';
import { FONTS, SPACING, RADIUS } from '../constants/typography';
import { getClients } from '../utils/storage';
import LoadingOverlay from '../components/LoadingOverlay';

export default function ClientsScreen({ navigation, route }) {
  const { colors: COLORS } = useTheme();
  const styles = getStyles(COLORS);

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterByUser, setFilterByUser] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.filterByUser) {
        setFilterByUser(route.params.filterByUser);
      }
    }, [route.params?.filterByUser])
  );

  const loadClients = useCallback(async () => {
    setIsFetching(true);
    try {
      const data = await getClients();
      setClients(data);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadClients();
    }, [loadClients])
  );

  const displayedClients = filterByUser 
    ? clients.filter(c => c.processedBy === filterByUser)
    : clients;

  const handleCopyDetails = async () => {
    if (!selectedClient) return;
    const textToCopy = `Job Type: ${selectedClient.jobType || 'Install'}
Full name: ${selectedClient.firstName} ${selectedClient.lastName}
Email address: ${selectedClient.email || 'N/A'}
Phone Number: ${selectedClient.phone}
City/Municipality: ${selectedClient.city}
Address: ${selectedClient.address}
Plan: ${selectedClient.plan} (${selectedClient.price}/mo)
Notes: ${selectedClient.notes || 'None'}`;
    
    await Clipboard.setStringAsync(textToCopy);
    Alert.alert('Copied to Clipboard', 'You can now paste the details to your messenger.');
  };

  const handleShowMap = () => {
    if (!selectedClient) return;
    if (selectedClient.latitude && selectedClient.longitude) {
      const url = `https://www.google.com/maps?q=${selectedClient.latitude},${selectedClient.longitude}`;
      Linking.openURL(url);
    } else {
      Alert.alert('No Location Data', 'GPS coordinates were not saved for this client.');
    }
  };

  const renderClientItem = ({ item }) => {
    const dateStr = item.createdAt ? `${new Date(item.createdAt).toLocaleDateString()} ${new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '';
    return (
      <TouchableOpacity 
        style={styles.clientCard} 
        activeOpacity={0.7}
        onPress={() => {
          setSelectedClient(item);
          setModalVisible(true);
        }}
      >
        <LinearGradient
          colors={GRADIENT_ACCENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>
            {item.firstName?.[0]}{item.lastName?.[0]}
          </Text>
        </LinearGradient>
        
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{item.firstName} {item.lastName}</Text>
          <Text style={styles.clientPlan}>{item.plan} Plan</Text>
        </View>
        <Text style={styles.clientDate}>{dateStr}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
    <LoadingOverlay visible={isFetching} message="Fetching client data..." />
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
          <Text style={styles.searchPlaceholder}>Search clients...</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('SelectPlan')}
        >
          <LinearGradient
            colors={GRADIENT_ACCENT}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add" size={22} color={COLORS.bgPrimary} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Filter Banner */}
      {filterByUser ? (
        <View style={styles.filterBanner}>
          <Ionicons name="filter" size={16} color={COLORS.brandGreen} />
          <Text style={styles.filterBannerText}>Showing clients processed by: {filterByUser}</Text>
          <TouchableOpacity onPress={() => setFilterByUser(null)}>
            <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      ) : null}

      {displayedClients.length > 0 ? (
        <FlatList
          data={displayedClients}
          renderItem={renderClientItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBg}>
            <Ionicons name="people-outline" size={56} color={COLORS.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No Clients Yet</Text>
          <Text style={styles.emptySubtitle}>
            Add your first client to get started with managing your fiber network subscribers.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('SelectPlan')}
          >
            <LinearGradient
              colors={GRADIENT_ACCENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.emptyButtonGradient}
            >
              <Ionicons name="person-add" size={18} color={COLORS.bgPrimary} />
              <Text style={styles.emptyButtonText}>Add First Client</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
      {/* Client Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedClient && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Client Details</Text>
                  <TouchableOpacity 
                    style={styles.closeIconButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Ionicons name="close" size={20} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalProfileSection}>
                  <LinearGradient
                    colors={GRADIENT_BRAND}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.modalAvatarContainer}
                  >
                    <Text style={styles.modalAvatarText}>
                      {selectedClient.firstName?.[0]}{selectedClient.lastName?.[0]}
                    </Text>
                  </LinearGradient>
                  <Text style={styles.modalProfileName}>
                    {selectedClient.firstName} {selectedClient.lastName}
                  </Text>
                  <Text style={styles.modalProfilePlan}>{selectedClient.plan} Plan</Text>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <View style={styles.detailSection}>
                    <View style={styles.detailRow}>
                      <View style={styles.detailIconWrapper}>
                        <Ionicons name="mail-outline" size={18} color={COLORS.brandGreen} />
                      </View>
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Email</Text>
                        <Text style={styles.detailValue}>{selectedClient.email || 'Not provided'}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.detailIconWrapper}>
                        <Ionicons name="call-outline" size={18} color={COLORS.brandGreen} />
                      </View>
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Phone Number</Text>
                        <Text style={styles.detailValue}>{selectedClient.phone}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.detailIconWrapper}>
                        <Ionicons name="location-outline" size={18} color={COLORS.brandGreen} />
                      </View>
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Address</Text>
                        <Text style={styles.detailValue}>{selectedClient.address}, {selectedClient.city}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.detailIconWrapper}>
                        <Ionicons name="build-outline" size={18} color={COLORS.brandGreen} />
                      </View>
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Job Type</Text>
                        <Text style={styles.detailValue}>{selectedClient.jobType || 'Install'}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.detailIconWrapper}>
                        <Ionicons name="calendar-outline" size={18} color={COLORS.brandGreen} />
                      </View>
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Date Saved</Text>
                        <Text style={styles.detailValue}>{new Date(selectedClient.createdAt).toLocaleString()}</Text>
                      </View>
                    </View>

                    {selectedClient.processedBy ? (
                      <View style={styles.detailRow}>
                        <View style={styles.detailIconWrapper}>
                          <Ionicons name="person-outline" size={18} color={COLORS.brandGreen} />
                        </View>
                        <View style={styles.detailTextContainer}>
                          <Text style={styles.detailLabel}>Processed By</Text>
                          <Text style={styles.detailValue}>{selectedClient.processedBy}</Text>
                        </View>
                      </View>
                    ) : null}

                    {selectedClient.notes ? (
                      <View style={styles.detailRowNotes}>
                        <View style={styles.detailIconWrapper}>
                          <Ionicons name="document-text-outline" size={18} color={COLORS.brandGreen} />
                        </View>
                        <View style={styles.detailTextContainer}>
                          <Text style={styles.detailLabel}>Additional Notes</Text>
                          <Text style={styles.detailValueNotes}>{selectedClient.notes}</Text>
                        </View>
                      </View>
                    ) : null}
                  </View>
                </ScrollView>

                <View style={styles.modalActionButtons}>
                  <TouchableOpacity
                    style={styles.modalCopyButton}
                    onPress={handleCopyDetails}
                  >
                    <Ionicons name="copy-outline" size={18} color={COLORS.brandGreen} />
                    <Text style={styles.modalCopyText}>Copy Details</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.modalMapButton}
                    onPress={handleShowMap}
                  >
                    <Ionicons name="map-outline" size={18} color={COLORS.brandTeal} />
                    <Text style={styles.modalMapText}>Show in Map</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
    </>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  searchPlaceholder: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.md,
    marginLeft: SPACING.sm,
  },
  addButton: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: SPACING.xl,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.bgPrimary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  clientInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  clientName: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
  },
  clientPlan: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
  },
  clientDate: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    textAlign: 'right',
  },
  filterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 194, 154, 0.1)',
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(74, 194, 154, 0.2)',
  },
  filterBannerText: {
    flex: 1,
    color: COLORS.brandGreen,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    marginLeft: SPACING.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxxl,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: SPACING.xxl,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bgPrimary,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.xxl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  closeIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalProfileSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  modalAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  modalAvatarText: {
    color: COLORS.bgPrimary,
    fontSize: FONTS.sizes.display,
    fontWeight: FONTS.weights.bold,
  },
  modalProfileName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  modalProfilePlan: {
    fontSize: FONTS.sizes.md,
    color: COLORS.brandGreen,
    fontWeight: FONTS.weights.semibold,
  },
  modalBody: {
    marginBottom: SPACING.xl,
  },
  detailSection: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  detailRowNotes: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
  },
  detailIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(74, 194, 154, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
  },
  detailValueNotes: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    lineHeight: 20,
    marginTop: 2,
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalCopyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(74, 194, 154, 0.1)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(74, 194, 154, 0.3)',
    gap: SPACING.xs,
  },
  modalCopyText: {
    color: COLORS.brandGreen,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  modalMapButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(42, 188, 232, 0.1)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(42, 188, 232, 0.3)',
    gap: SPACING.xs,
  },
  modalMapText: {
    color: COLORS.brandTeal,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  modalCloseButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.bgSecondary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
});
