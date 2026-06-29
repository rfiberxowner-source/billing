import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../constants/typography';
import { updateTechnicianPassword } from '../utils/storage';

export default function SettingsScreen() {
  const { isDark, toggleTheme, colors: COLORS } = useTheme();
  const styles = getStyles(COLORS);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in both password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      setIsUpdating(true);
      const userStr = await AsyncStorage.getItem('@rfiberx_user');
      if (!userStr) {
        Alert.alert('Error', 'User not found. Please log in again.');
        setIsUpdating(false);
        return;
      }

      const user = JSON.parse(userStr);
      await updateTechnicianPassword(user.id, newPassword);
      
      Alert.alert('Success', 'Password has been updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', 'Failed to update password.');
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>APPEARANCE</Text>
        
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingIconWrapper}>
              <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={COLORS.brandGreen} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>
                {isDark ? 'Dark theme is currently active' : 'Light theme is currently active'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: COLORS.borderColor, true: COLORS.brandGreen }}
              thumbColor={COLORS.bgPrimary}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>SECURITY</Text>

        <View style={styles.settingCard}>
          <View style={styles.settingRowForm}>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleChangePassword}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color={COLORS.bgPrimary} />
              ) : (
                <Text style={styles.buttonText}>Change Password</Text>
              )}
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
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    letterSpacing: 1.5,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  settingCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  settingIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(74, 194, 154, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    marginBottom: 2,
  },
  settingDescription: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
  },
  settingRowForm: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    paddingHorizontal: SPACING.md,
    height: 50,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
  },
  button: {
    backgroundColor: COLORS.brandGreen,
    borderRadius: RADIUS.md,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  buttonText: {
    color: COLORS.bgPrimary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
});
