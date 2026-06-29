import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import * as Location from 'expo-location';
import { COLORS, GRADIENT_BRAND, GRADIENT_ACCENT } from '../constants/colors';
import { FONTS, SPACING, RADIUS } from '../constants/typography';
import { saveClient } from '../utils/storage';
import { useScrollToTop } from '../utils/hooks';
import LoadingOverlay from '../components/LoadingOverlay';

const CITY_OPTIONS = ['Magdalena', 'Majayjay'];
const JOB_OPTIONS = ['Install', 'Repair'];

export default function AddClientScreen({ route, navigation }) {
  const { colors: COLORS } = useTheme();
  const styles = getStyles(COLORS);
  
  const scrollRef = useScrollToTop();

  const selectedPlan = route.params?.selectedPlan || { speed: 'Unknown', price: '₱0' };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Magdalena',
    plan: selectedPlan.speed,
    jobType: 'Install',
    status: 'Active',
    notes: '',
  });

  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (route.params?.selectedPlan) {
      setFormData((prev) => ({
        ...prev,
        plan: route.params.selectedPlan.speed,
      }));
    }
  }, [route.params?.selectedPlan]);

  const updateField = (field, value) => {
    if (field === 'phone') {
      // Remove any non-numeric characters
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData((prev) => ({ ...prev, [field]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Get current exact date and time
  const now = new Date();
  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString();

  const generatedSummary = `Job Type: ${formData.jobType}
Full name: ${formData.firstName} ${formData.lastName}
Email address: ${formData.email || 'N/A'}
Phone Number: ${formData.phone}
City/Municipality: ${formData.city}
Address: ${formData.address}
Plan: ${formData.plan} (${selectedPlan.price}/month)
Notes: ${formData.notes || 'None'}`;

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(generatedSummary);
    Alert.alert('Copied', 'Client details copied to clipboard!');
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.address) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address ending with a domain provider (e.g., @gmail.com).');
      return;
    }

    // Phone validation (must start with 09, strictly 11 digits, numeric only)
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      Alert.alert('Invalid Phone', 'Phone number must start with 09 and be exactly 11 digits long.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const userStr = await AsyncStorage.getItem('@rfiberx_user');
      const user = userStr ? JSON.parse(userStr) : null;
      const processedBy = user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Unknown';

      const clientData = {
        ...formData,
        plan: selectedPlan.speed,
        price: selectedPlan.price,
        processedBy: processedBy,
        latitude: null,
        longitude: null,
      };

      // Silently capture GPS coordinates
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        const servicesEnabled = await Location.hasServicesEnabledAsync();

        if (!servicesEnabled) {
          Alert.alert(
            'GPS is Disabled',
            'Your phone\'s GPS is currently turned off. Please swipe down and turn on Location/GPS so the client\'s map pinpoint can be saved.',
            [{ text: 'OK' }]
          );
          setIsSubmitting(false);
          return;
        }

        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          clientData.latitude = loc.coords.latitude;
          clientData.longitude = loc.coords.longitude;
        }
      } catch (locErr) {
        console.warn('Could not get GPS location:', locErr);
      }

      await saveClient(clientData);

      Alert.alert(
        'Client Saved',
        `${formData.firstName} ${formData.lastName} has been added successfully.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                address: '',
                city: 'Magdalena',
                plan: selectedPlan.speed,
                jobType: 'Install',
                status: 'Active',
                notes: '',
              });
              navigation.navigate('Dashboard');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save client data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (label, field, placeholder, options = {}) => {
    const isFocused = focusedField === field;
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {label}
        </Text>
        <View
          style={[
            styles.inputWrapper,
            isFocused && styles.inputWrapperFocused,
          ]}
        >
          <TextInput
            style={[styles.input, options.multiline && styles.inputMultiline]}
            value={formData[field]}
            onChangeText={(text) => updateField(field, text)}
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
            placeholder={placeholder || `Enter ${label}`}
            placeholderTextColor={COLORS.textMuted}
            keyboardType={options.keyboardType || 'default'}
            autoCapitalize={options.autoCapitalize || 'sentences'}
            maxLength={options.maxLength}
            multiline={options.multiline}
            numberOfLines={options.multiline ? 3 : 1}
          />
        </View>
      </View>
    );
  };

  const renderPicker = (label, field, options) => {
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.pickerRow}>
          {options.map((option) => {
            const isSelected = formData[field] === option;
            return (
              <TouchableOpacity
                key={option}
                style={[styles.pickerOption, isSelected && styles.pickerOptionActive]}
                onPress={() => updateField(field, option)}
                activeOpacity={0.7}
              >
                {isSelected ? (
                  <LinearGradient
                    colors={GRADIENT_ACCENT}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.pickerGradient}
                  >
                    <Text style={styles.pickerTextActive}>{option}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.pickerText}>{option}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <>
    <LoadingOverlay visible={isSubmitting} message="Saving client data..." />
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.pageHeader}>
          <View style={styles.pageIconBg}>
            <Ionicons name="person-add" size={24} color={COLORS.brandGreen} />
          </View>
          <View>
            <Text style={styles.pageTitle}>Add New Client</Text>
            <Text style={styles.pageSubtitle}>
              Fill in the client information below
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="flash-outline" size={16} color={COLORS.brandGreen} />
            {'  '}Service Information
          </Text>
          <View style={[styles.sectionCard, styles.serviceInfoCard]}>
            <View style={styles.serviceInfoRow}>
              <View>
                <Text style={styles.serviceSpeed}>{selectedPlan.speed}</Text>
                <Text style={styles.servicePrice}>{selectedPlan.price} / month</Text>
              </View>
              <TouchableOpacity
                style={styles.changePlanButton}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('SelectPlan')}
              >
                <Ionicons name="swap-horizontal" size={16} color={COLORS.bgPrimary} />
                <Text style={styles.changePlanText}>Change Plan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="person-outline" size={16} color={COLORS.brandGreen} />
            {'  '}Personal Information
          </Text>
          <View style={styles.sectionCard}>
            {renderInput('First Name *', 'firstName', 'Juan')}
            {renderInput('Last Name *', 'lastName', 'Dela Cruz')}
            {renderInput('Email Address', 'email', 'juan@example.com', { keyboardType: 'email-address', autoCapitalize: 'none' })}
            {renderInput('Phone Number *', 'phone', '09123456789', { keyboardType: 'numeric', maxLength: 11 })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="location-outline" size={16} color={COLORS.brandGreen} />
              {'  '}Location Details
            </Text>
          </View>
          <View style={styles.sectionCard}>
            {renderPicker('Job Type *', 'jobType', JOB_OPTIONS)}
            {renderPicker('City / Municipality *', 'city', CITY_OPTIONS)}
            {renderInput('Address *', 'address', 'Street address, house number...')}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="document-text-outline" size={16} color={COLORS.brandGreen} />
            {'  '}Additional Notes
          </Text>
          <View style={styles.sectionCard}>
            {renderInput('Notes', 'notes', 'Any additional notes...', { multiline: true })}
          </View>
        </View>

        {/* Client Summary Preview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="copy-outline" size={16} color={COLORS.brandGreen} />
            {'  '}Client Summary Preview
          </Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>{generatedSummary}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              activeOpacity={0.7}
              onPress={copyToClipboard}
            >
              <Ionicons name="copy" size={16} color={COLORS.brandGreen} />
              <Text style={styles.copyButtonText}>Copy Text</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          activeOpacity={0.8}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={GRADIENT_ACCENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={COLORS.bgPrimary} />
            ) : (
              <>
                <Ionicons name="save" size={20} color={COLORS.bgPrimary} />
                <Text style={styles.submitText}>Save Client</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
    </>
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
    paddingBottom: SPACING.xxxl * 2,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  pageIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(74, 194, 154, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  pageTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
  },
  pageSubtitle: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brandGreen,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
  },
  gpsButtonText: {
    color: COLORS.bgPrimary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  sectionCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  serviceInfoCard: {
    backgroundColor: 'rgba(74, 194, 154, 0.05)',
    borderColor: 'rgba(74, 194, 154, 0.2)',
  },
  serviceInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceSpeed: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
  },
  servicePrice: {
    color: COLORS.brandGreen,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    marginTop: 2,
  },
  changePlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.textSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  changePlanText: {
    color: COLORS.bgPrimary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    marginLeft: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfField: {
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
  requiredStar: {
    color: COLORS.error,
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
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  pickerOption: {
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.borderColor,
    overflow: 'hidden',
  },
  pickerOptionActive: {
    borderColor: 'transparent',
  },
  pickerGradient: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
  },
  pickerText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  pickerTextActive: {
    color: COLORS.bgPrimary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  summaryCard: {
    backgroundColor: 'rgba(74, 194, 154, 0.05)',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(74, 194, 154, 0.2)',
  },
  summaryText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(74, 194, 154, 0.1)',
    borderRadius: RADIUS.md,
  },
  copyButtonText: {
    color: COLORS.brandGreen,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    marginLeft: SPACING.sm,
  },
  submitButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.md,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
  },
  submitText: {
    color: COLORS.bgPrimary,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    marginLeft: SPACING.sm,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    marginTop: SPACING.sm,
  },
  cancelText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
  },
});
