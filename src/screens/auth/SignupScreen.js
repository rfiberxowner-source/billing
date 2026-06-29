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
import { COLORS, GRADIENT_ACCENT } from '../../constants/colors';
import { FONTS, SPACING, RADIUS } from '../../constants/typography';
import { registerTechnician } from '../../utils/storage';

export default function SignupScreen({ navigation, route, onLogin }) {
  const { colors: COLORS } = useTheme();
  const styles = getStyles(COLORS);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('technicians@rfiberx.net');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async () => {
    if (!firstName || !lastName || !password) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newTech = await registerTechnician({ firstName, lastName, email, password });
      
      if (onLogin) {
        onLogin(newTech);
      }
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
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
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.screenTitle}>Create Account</Text>
          <Text style={styles.screenSubtitle}>Sign up as a new technician</Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.row}>
            {/* First Name Input */}
            <View style={[styles.inputGroup, styles.halfInput]}>
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
                  placeholder="Juan"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>

            {/* Last Name Input */}
            <View style={[styles.inputGroup, styles.halfInput]}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'lastName' && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  onFocus={() => setFocusedField('lastName')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Dela Cruz"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedField === 'email' && styles.inputWrapperFocused,
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={focusedField === 'email' ? COLORS.brandGreen : COLORS.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="tech@rfiberx.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
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
                placeholder="Create a password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
              />
            </View>
          </View>

          {/* Signup Button */}
          <TouchableOpacity
          style={styles.signupButton}
          activeOpacity={0.8}
          onPress={handleSignup}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={GRADIENT_ACCENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.signupGradient}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={COLORS.bgPrimary} />
            ) : (
              <Text style={styles.signupText}>Create Account</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLinkText}> Sign In</Text>
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
    padding: SPACING.xl,
    paddingTop: SPACING.xxxl,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    marginBottom: SPACING.xxxl,
  },
  screenTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.display,
    fontWeight: FONTS.weights.bold,
    marginBottom: SPACING.xs,
  },
  screenSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
  },
  formSection: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfInput: {
    flex: 1,
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
  signupButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  signupGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
  },
  signupText: {
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
  loginLinkText: {
    color: COLORS.brandGreen,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
  },
});
