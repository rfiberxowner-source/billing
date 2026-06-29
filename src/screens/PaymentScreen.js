import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENT_ACCENT } from '../constants/colors';
import { FONTS, SPACING, RADIUS } from '../constants/typography';
import { useScrollToTop } from '../utils/hooks';

export default function PaymentScreen({ navigation }) {
  const { colors: COLORS } = useTheme();
  const styles = getStyles(COLORS);
  const scrollRef = useScrollToTop();
  const [isImageModalVisible, setImageModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Info</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {/* Payment Methods Section */}
        <View style={styles.methodsContainer}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          
          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="phone-portrait-outline" size={24} color={COLORS.brandGreen} />
              </View>
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentTitle}>GCash</Text>
                <Text style={styles.paymentSubtitle}>Send payments directly to:</Text>
                <Text style={styles.highlightText}>0905 839 5471</Text>
              </View>
            </View>
          </View>

          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="card-outline" size={24} color={COLORS.brandGreen} />
              </View>
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentTitle}>Bank Transfer</Text>
                <Text style={styles.paymentSubtitle}>Available Bank:</Text>
                <Text style={styles.paymentText}>BDO</Text>
                <Text style={styles.paymentNote}>Contact the owner to know the BDO bank transfer details</Text>
              </View>
            </View>
          </View>

          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="location-outline" size={24} color={COLORS.brandGreen} />
              </View>
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentTitle}>Direct Payment (Office)</Text>
                <Text style={styles.paymentSubtitle}>Visit us at our office location:</Text>
                <Text style={styles.paymentText}>Salasad, Magdalena, Laguna, Philippines</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Office Image Section */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Our Office</Text>
          <TouchableOpacity 
            style={styles.imageWrapper} 
            activeOpacity={0.8}
            onPress={() => setImageModalVisible(true)}
          >
            <Image 
              source={require('../../assets/house3.jpeg')}
              style={styles.officeImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <Ionicons name="expand-outline" size={24} color={COLORS.bgPrimary} />
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Full Screen Image Modal */}
      <Modal
        visible={isImageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => setImageModalVisible(false)}
          >
            <Ionicons name="close" size={32} color="#FFFFFF" />
          </TouchableOpacity>
          <Image 
            source={require('../../assets/house3.jpeg')}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.bgPrimary,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  contentContainer: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  methodsContainer: {
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  paymentCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(74, 194, 154, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  paymentSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  paymentText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.medium,
  },
  highlightText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.brandGreen,
    fontWeight: FONTS.weights.bold,
    marginTop: SPACING.xs,
  },
  imageSection: {
    marginTop: SPACING.md,
  },
  imageWrapper: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  officeImage: {
    width: '100%',
    height: 200,
  },
  imageOverlay: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: RADIUS.full,
    padding: SPACING.xs,
  },
  paymentNote: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.brandOrange,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: SPACING.sm,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
});
