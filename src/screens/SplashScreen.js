import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS, SPACING, RADIUS } from '../constants/typography';
import { COLORS } from '../constants/colors';

export default function SplashScreen() {
  const { colors: themeColors } = useTheme();
  const styles = getStyles(themeColors);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [loadingText, setLoadingText] = useState('Connecting to database...');

  useEffect(() => {
    // Sequence of loading texts
    const timeouts = [
      setTimeout(() => setLoadingText('Initializing system...'), 1500),
      setTimeout(() => setLoadingText('Loading resources...'), 2500)
    ];

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3500,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    return () => timeouts.forEach(clearTimeout);
  }, [progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F1923', '#162231']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <View style={styles.iconWrapper}>
          <Ionicons name="wifi" size={80} color="#E53935" />
        </View>
        <Text style={styles.logoText}>
          <Text style={styles.logoR}>R</Text>
          <Text style={styles.logoFiber}>FIBER</Text>
          <Text style={styles.logoX}>X</Text>
        </Text>
      </View>

      {/* Loading Section */}
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{loadingText}</Text>
        
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>
      </View>
    </View>
  );
}

const getStyles = (themeColors) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxxl * 2,
  },
  iconWrapper: {
    marginRight: -10,
    marginTop: 6,
    transform: [{ rotate: '-45deg' }],
  },
  logoText: {
    fontSize: 70,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -2,
  },
  logoR: { color: '#E53935', fontWeight: '900' },
  logoFiber: { color: '#FFFFFF', fontWeight: '900' },
  logoX: { color: '#E53935', fontWeight: '900' },
  
  loadingContainer: {
    position: 'absolute',
    bottom: '20%',
    width: '80%',
    alignItems: 'center',
  },
  loadingText: {
    color: '#8FA3B8',
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    marginBottom: SPACING.md,
    letterSpacing: 1,
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: RADIUS.round,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#E53935',
    borderRadius: RADIUS.round,
  }
});
