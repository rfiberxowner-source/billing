import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENT_BRAND, GRADIENT_ACCENT } from '../constants/colors';
import { FONTS, SPACING, RADIUS } from '../constants/typography';

export default function AccountScreen({ navigation }) {
  const { colors: COLORS } = useTheme();
  const styles = getStyles(COLORS);

  return (
    <View style={styles.container}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <LinearGradient
          colors={GRADIENT_BRAND}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarLarge}
        >
          <Ionicons name="person" size={40} color={COLORS.bgPrimary} />
        </LinearGradient>
        <Text style={styles.profileName}>Administrator</Text>
        <Text style={styles.profileEmail}>admin@rfiberx.com</Text>

        <View style={styles.roleBadge}>
          <Ionicons name="shield-checkmark" size={14} color={COLORS.brandGreen} />
          <Text style={styles.roleText}>Super Admin</Text>
        </View>
      </View>

      {/* Account Options */}
      <View style={styles.optionsSection}>
        {[
          { icon: 'person-outline', label: 'Edit Profile', color: COLORS.brandGreen },
          { icon: 'lock-closed-outline', label: 'Change Password', color: COLORS.brandYellow },
          { icon: 'notifications-outline', label: 'Notifications', color: COLORS.info },
          { icon: 'cloud-outline', label: 'Backup & Sync', color: COLORS.brandOrange },
          { icon: 'information-circle-outline', label: 'About RFiberX', color: COLORS.textSecondary },
        ].map((option, index) => (
          <TouchableOpacity key={index} style={styles.optionItem} activeOpacity={0.7}>
            <View style={[styles.optionIcon, { backgroundColor: `${option.color}15` }]}>
              <Ionicons name={option.icon} size={20} color={option.color} />
            </View>
            <Text style={styles.optionLabel}>{option.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    padding: SPACING.xl,
  },
  profileCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    marginBottom: SPACING.xxl,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  profileName: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
  },
  profileEmail: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.md,
    marginTop: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 194, 154, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginTop: SPACING.md,
  },
  roleText: {
    color: COLORS.brandGreen,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    marginLeft: SPACING.xs,
  },
  optionsSection: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  optionLabel: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    marginTop: SPACING.xxl,
    backgroundColor: 'rgba(232, 76, 76, 0.08)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(232, 76, 76, 0.2)',
  },
  logoutText: {
    color: COLORS.error,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    marginLeft: SPACING.sm,
  },
});
