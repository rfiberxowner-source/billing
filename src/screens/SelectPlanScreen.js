import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENT_BRAND, GRADIENT_ACCENT } from '../constants/colors';
import { FONTS, SPACING, RADIUS } from '../constants/typography';
import { useScrollToTop } from '../utils/hooks';

const AVAILABLE_PLANS = [
  { id: '30m', speed: '30 Mbps', price: '₱800', description: 'Perfect for small families and basic browsing' },
  { id: '50m', speed: '50 Mbps', price: '₱1,000', description: 'Great for streaming and work from home' },
  { id: '70m', speed: '70 Mbps', price: '₱1,300', description: 'Ideal for multiple devices and HD streaming' },
  { id: '100m', speed: '100 Mbps', price: '₱1,500', description: 'Fast downloads and 4K streaming' },
  { id: '200m', speed: '200 Mbps', price: '₱2,000', description: 'Ultimate speed for heavy users and gaming' },
];

export default function SelectPlanScreen({ navigation }) {
  const { colors: COLORS } = useTheme();
  const styles = getStyles(COLORS);
  const scrollRef = useScrollToTop();

  const handleSelectPlan = (plan) => {
    navigation.navigate('AddClient', { selectedPlan: plan });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconBg}>
            <Ionicons name="speedometer" size={28} color={COLORS.brandGreen} />
          </View>
          <Text style={styles.title}>Select a Plan</Text>
          <Text style={styles.subtitle}>
            Choose the internet plan for the new client before proceeding to registration.
          </Text>
        </View>

        <View style={styles.plansList}>
          {AVAILABLE_PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={styles.planCard}
              activeOpacity={0.7}
              onPress={() => handleSelectPlan(plan)}
            >
              <View style={styles.planHeader}>
                <View style={styles.speedContainer}>
                  <Text style={styles.speedText}>{plan.speed}</Text>
                </View>
                <Text style={styles.priceText}>
                  {plan.price}<Text style={styles.priceSuffix}>/mo</Text>
                </Text>
              </View>
              
              <Text style={styles.planDescription}>{plan.description}</Text>
              
              <View style={styles.selectButton}>
                <Text style={styles.selectButtonText}>Select Plan</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.brandGreen} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  iconBg: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 194, 154, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  plansList: {
    gap: SPACING.lg,
  },
  planCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1.5,
    borderColor: COLORS.borderColor,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  speedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speedText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
  },
  priceText: {
    color: COLORS.brandGreen,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
  },
  priceSuffix: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
  planDescription: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.md,
  },
  selectButtonText: {
    color: COLORS.brandGreen,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    marginRight: SPACING.xs,
  },
});
