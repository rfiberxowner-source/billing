import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENT_BRAND } from '../constants/colors';
import { FONTS, SPACING } from '../constants/typography';

export default function Header({ onMenuPress, onAccountPress, title }) {
  const { colors: COLORS } = useTheme();
  const styles = getStyles(COLORS);

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
      <View style={styles.headerContainer}>
        {/* Left side: Menu + Logo */}
        <View style={styles.leftSection}>
          <TouchableOpacity
            onPress={onMenuPress}
            style={styles.menuButton}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={26} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {/* RFIBERX Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.wifiIconWrapper}>
              <Ionicons name="wifi" size={22} color="#E53935" />
            </View>
            <Text style={styles.logoText}>
              <Text style={styles.logoR}>R</Text>
              <Text style={styles.logoFiber}>FIBER</Text>
              <Text style={styles.logoX}>X</Text>
            </Text>
          </View>
        </View>

        {/* Center: Optional title */}
        {title && (
          <View style={styles.centerSection}>
            <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
          </View>
        )}

        {/* Right side: Placeholder */}
        <View style={styles.rightSection}>
          <View style={{ width: 40 }} />
        </View>
      </View>
    </View>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  headerWrapper: {
    backgroundColor: COLORS.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  headerContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wifiIconWrapper: {
    marginRight: -2,
    marginTop: 2,
    transform: [{ rotate: '-45deg' }],
  },
  logoText: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  logoR: {
    color: '#E53935',
    fontWeight: '900',
  },
  logoFiber: {
    color: COLORS.textPrimary,
    fontWeight: '900',
  },
  logoX: {
    color: '#E53935',
    fontWeight: '900',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  titleText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
});
