import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, SPACING, RADIUS } from '../constants/typography';

export default function LoadingOverlay({ visible, message = "Loading..." }) {
  const { colors: COLORS, isDark } = useTheme();
  
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: COLORS.bgCard, borderColor: COLORS.borderColor }]}>
          <View style={styles.logoContainer}>
            <View style={styles.iconWrapper}>
              <Ionicons name="wifi" size={24} color="#E53935" />
            </View>
            <Text style={styles.logoText}>
              <Text style={styles.logoR}>R</Text>
              <Text style={styles.logoFiber}>FIBER</Text>
              <Text style={styles.logoX}>X</Text>
            </Text>
          </View>
          
          <ActivityIndicator size="large" color="#E53935" style={styles.spinner} />
          
          <Text style={[styles.message, { color: COLORS.textPrimary }]}>{message}</Text>
          <Text style={[styles.subMessage, { color: COLORS.textMuted }]}>
            Please wait, this might take a moment depending on your connection.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  iconWrapper: {
    marginRight: -4,
    marginTop: 2,
    transform: [{ rotate: '-45deg' }],
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  logoR: { color: '#E53935', fontWeight: '900' },
  logoFiber: { color: '#8FA3B8', fontWeight: '900' },
  logoX: { color: '#E53935', fontWeight: '900' },
  spinner: {
    marginBottom: SPACING.lg,
  },
  message: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subMessage: {
    fontSize: FONTS.sizes.xs,
    textAlign: 'center',
    lineHeight: 18,
  }
});
