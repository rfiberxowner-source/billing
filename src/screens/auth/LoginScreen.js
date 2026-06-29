import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENT_BRAND, GRADIENT_ACCENT } from '../../constants/colors';
import { FONTS, SPACING, RADIUS } from '../../constants/typography';
import { loginTechnician } from '../../utils/storage';

export default function LoginScreen({ navigation, route, onLogin }) {
  const { colors: COLORS } = useTheme();
  const styles = getStyles(COLORS);

  // We receive onLogin directly via props from AppNavigator
  
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!firstName || !password) {
      Alert.alert('Missing Fields', 'Please enter your first name and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const tech = await loginTechnician(firstName, password);
      
      if (onLogin) {
        onLogin(tech);
      }
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoSection}>
          <View style={styles.customLogoContainer}>
            <View style={styles.customLogoIconWrapper}>
              <Ionicons name="wifi" size={64} color="#E53935" />
            </View>
            <Text style={styles.brandName}>
              <Text style={styles.brandR}>R</Text>
              <Text style={styles.brandFiber}>FIBER</Text>
              <Text style={styles.brandX}>X</Text>
            </Text>
          </View>
          <Text style={styles.screenTitle}>Technician Login</Text>
        </View>

        <View style={styles.formSection}>
          {/* First Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>First Name</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedField === 'firstName' && styles.inputWrapperFocused,
              ]}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={focusedField === 'firstName' ? COLORS.brandGreen : COLORS.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                onFocus={() => setFocusedField('firstName')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your first name"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedField === 'password' && styles.inputWrapperFocused,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={focusedField === 'password' ? COLORS.brandGreen : COLORS.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            activeOpacity={0.8}
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            <LinearGradient
              colors={GRADIENT_ACCENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginGradient}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={COLORS.bgPrimary} />
              ) : (
                <>
                  <Text style={styles.loginText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.bgPrimary} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Signup Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>New technician?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupText}> Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  customLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: SPACING.md,
  },
  customLogoIconWrapper: {
    marginRight: -6,
    marginTop: 4,
    transform: [{ rotate: '-45deg' }],
  },
  brandName: {
    fontSize: 54,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -1.5,
  },
  brandR: { color: '#E53935', fontWeight: '900' },
  brandFiber: { color: COLORS.textPrimary, fontWeight: '900' },
  brandX: { color: '#E53935', fontWeight: '900' },
  screenTitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.medium,
    marginTop: SPACING.sm,
  },
  formSection: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    marginBottom: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.borderColor,
    paddingHorizontal: SPACING.md,
  },
  inputWrapperFocused: {
    borderColor: COLORS.borderFocused,
    backgroundColor: COLORS.bgInputFocused,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    paddingVertical: SPACING.md,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.xl,
  },
  forgotText: {
    color: COLORS.brandGreen,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
  loginButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  loginGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  loginText: {
    color: COLORS.bgPrimary,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.md,
  },
  signupText: {
    color: COLORS.brandGreen,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
  },
});
