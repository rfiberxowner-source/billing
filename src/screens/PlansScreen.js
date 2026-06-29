import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useScrollToTop } from '../utils/hooks';
import { GRADIENT_BRAND } from '../constants/colors';
import { FONTS, SPACING, RADIUS } from '../constants/typography';

const INSTALLATION_FEE = 500;

const AVAILABLE_PLANS = [
  { id: '30m', speed: '30 Mbps', price: '₱800', numericPrice: 800, description: 'Perfect for small families and basic browsing', features: ['Basic Browsing', 'Standard Definition Streaming', 'Up to 3 Devices'] },
  { id: '50m', speed: '50 Mbps', price: '₱1,000', numericPrice: 1000, description: 'Great for streaming and work from home', features: ['Work From Home', 'High Definition Streaming', 'Up to 5 Devices'] },
  { id: '70m', speed: '70 Mbps', price: '₱1,300', numericPrice: 1300, description: 'Ideal for multiple devices and HD streaming', features: ['Online Gaming', 'Ultra HD Streaming', 'Up to 8 Devices'] },
  { id: '100m', speed: '100 Mbps', price: '₱1,500', numericPrice: 1500, description: 'Fast downloads and 4K streaming', features: ['Heavy Downloading', '4K Streaming', 'Unlimited Devices'] },
  { id: '200m', speed: '200 Mbps', price: '₱2,000', numericPrice: 2000, description: 'Ultimate speed for heavy users and gaming', features: ['Professional Gaming', 'Multiple 4K Streams', 'Smart Home Ready'] },
];

export default function PlansScreen() {
  const { colors: COLORS } = useTheme();
  const styles = getStyles(COLORS);
  const scrollRef = useScrollToTop();

  return (
    <ScrollView 
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Internet Plans</Text>
        <Text style={styles.subtitle}>Discover our highly competitive, lightning-fast fiber internet packages tailored for your needs.</Text>
      </View>

      <View style={styles.plansContainer}>
        {AVAILABLE_PLANS.map((plan) => {
          return (
            <View key={plan.id} style={styles.planCard}>
              <View style={styles.planHeader}>
                <Text style={styles.speedText}>{plan.speed}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceSymbol}>₱</Text>
                  <Text style={styles.priceText}>{plan.price.replace('₱', '')}</Text>
                  <Text style={styles.priceSuffix}>/mo</Text>
                </View>
              </View>

              <Text style={styles.description}>{plan.description}</Text>

              <View style={styles.divider} />

              <View style={styles.featuresList}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.brandGreen} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>
      
      {/* Installation Fee Section */}
      <View style={styles.installSection}>
        <View style={styles.installHeader}>
          <Ionicons name="construct-outline" size={22} color={COLORS.brandOrange} />
          <Text style={styles.installTitle}>Installation Fee</Text>
        </View>
        <Text style={styles.installDescription}>
          A one-time installation fee of <Text style={styles.highlight}>₱{INSTALLATION_FEE}</Text> is required upon setup. This covers equipment setup, cabling, and router configuration.
        </Text>
      </View>

      {/* Advance Payment Section */}
      <View style={styles.installSection}>
        <View style={styles.installHeader}>
          <Ionicons name="calculator-outline" size={22} color={COLORS.brandTeal} />
          <Text style={styles.installTitle}>Advance Payment Breakdown</Text>
        </View>
        <Text style={styles.installDescription}>
          Clients are required to pay an advance for the month. If the installation is done mid-month, only half the monthly rate is charged as advance.
        </Text>

        {/* Calculation Table */}
        <View style={styles.calcTable}>
          {/* Table Header */}
          <View style={styles.calcHeaderRow}>
            <Text style={[styles.calcHeaderText, { flex: 1.2 }]}>Plan</Text>
            <Text style={[styles.calcHeaderText, { flex: 1.2 }]}>Mid-Month Setup</Text>
            <Text style={[styles.calcHeaderText, { flex: 1.2 }]}>Full Month Setup</Text>
          </View>

          {/* Table Rows */}
          {AVAILABLE_PLANS.map((plan) => {
            const halfMonth = Math.round(plan.numericPrice / 2);
            const fullMonth = plan.numericPrice;
            const midMonthTotal = INSTALLATION_FEE + halfMonth;
            const fullMonthTotal = INSTALLATION_FEE + fullMonth;
            return (
              <View key={plan.id} style={styles.calcRow}>
                <Text style={[styles.calcCell, { flex: 1.2 }]}>{plan.speed}</Text>
                <Text style={[styles.calcCell, { flex: 1.2 }]}>₱{midMonthTotal.toLocaleString()}</Text>
                <Text style={[styles.calcCellTotal, { flex: 1.2 }]}>₱{fullMonthTotal.toLocaleString()}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.calcNote}>
          <Ionicons name="information-circle" size={16} color={COLORS.textMuted} />
          <Text style={styles.calcNoteText}>Totals include the ₱500 Installation Fee + Advance Payment</Text>
        </View>
      </View>

      <View style={styles.footerNote}>
        <Ionicons name="information-circle-outline" size={20} color={COLORS.textMuted} />
        <Text style={styles.footerNoteText}>All plans come with a free Wi-Fi router and no data capping.</Text>
      </View>
    </ScrollView>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  contentContainer: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  header: {
    marginBottom: SPACING.xxl,
    alignItems: 'center',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.display,
    fontWeight: FONTS.weights.bold,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },
  plansContainer: {
    gap: SPACING.xl,
  },
  planCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  speedText: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: FONTS.weights.extrabold,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceSymbol: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    marginRight: 2,
  },
  priceText: {
    color: COLORS.brandGreen,
    fontSize: 28,
    fontWeight: FONTS.weights.extrabold,
  },
  priceSuffix: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    marginLeft: 2,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.lg,
  },
  featuresList: {
    gap: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.sm,
    marginLeft: SPACING.sm,
    fontWeight: FONTS.weights.medium,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xxxl,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  footerNoteText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  installSection: {
    marginTop: SPACING.xxl,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  installHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  installTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    marginLeft: SPACING.sm,
  },
  installDescription: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    lineHeight: 22,
  },
  highlight: {
    color: COLORS.brandOrange,
    fontWeight: FONTS.weights.bold,
  },
  calcTable: {
    marginTop: SPACING.lg,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  calcHeaderRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgInput,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  calcHeaderText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calcRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  calcCell: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
  calcCellTotal: {
    color: COLORS.brandGreen,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  calcNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  calcNoteText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    marginLeft: SPACING.xs,
    fontStyle: 'italic',
  },
});
