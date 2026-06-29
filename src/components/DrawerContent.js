import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENT_BRAND, GRADIENT_ACCENT } from '../constants/colors';
import { FONTS, SPACING, RADIUS } from '../constants/typography';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid-outline', screen: 'Dashboard' },
  { id: 'clients', label: 'Clients', icon: 'people-outline', screen: 'Clients' },
  { id: 'add-client', label: 'Add Client', icon: 'person-add-outline', screen: 'SelectPlan' },
  { id: 'payment-info', label: 'Payment Info', icon: 'card-outline', screen: 'Payment' },
  { id: 'plans', label: 'Plans', icon: 'pricetag-outline', screen: 'Plans' },
  { id: 'settings', label: 'Settings', icon: 'settings-outline', screen: 'Settings' },
];

export default function DrawerContent({ navigation, state, user, onLogout }) {
  const { colors: COLORS } = useTheme();
  const styles = getStyles(COLORS);

  const insets = useSafeAreaInsets();
  const activeRoute = state?.routes?.[state.index]?.name;
  
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    loadProfileImage();
  }, []);

  const loadProfileImage = async () => {
    try {
      const savedImage = await AsyncStorage.getItem('profileImage');
      if (savedImage) {
        setProfileImage(savedImage);
      }
    } catch (error) {
      console.log('Error loading profile image:', error);
    }
  };

  const handleProfilePress = () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Remove Photo', onPress: removeImage, style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setProfileImage(uri);
        await AsyncStorage.setItem('profileImage', uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = async () => {
    try {
      setProfileImage(null);
      await AsyncStorage.removeItem('profileImage');
    } catch (error) {
      console.log('Error removing image', error);
    }
  };

  // Format the display name (fallback to 'Technician' if no name provided)
  const displayName = user?.firstName 
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'Technician';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Drawer Header */}
      <View style={styles.drawerHeader}>
        <TouchableOpacity onPress={handleProfilePress} activeOpacity={0.8}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.logoCircle} />
          ) : (
            <LinearGradient
              colors={GRADIENT_BRAND}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoCircle}
            >
              <Ionicons name="wifi" size={28} color={COLORS.bgPrimary} />
            </LinearGradient>
          )}
        </TouchableOpacity>
        <View style={styles.brandInfo}>
          <Text style={styles.brandName} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.brandTagline}>Technician</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Menu Items */}
      <ScrollView
        style={styles.menuScrollView}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>NAVIGATION</Text>
        {MENU_ITEMS.map((item) => {
          const isActive = activeRoute === item.screen;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(item.screen)}
            >
              {isActive && (
                <LinearGradient
                  colors={GRADIENT_ACCENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activeIndicator}
                />
              )}
              <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
                <Ionicons
                  name={isActive ? item.icon.replace('-outline', '') : item.icon}
                  size={20}
                  color={isActive ? COLORS.brandGreen : COLORS.textMuted}
                />
              </View>
              <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                {item.label}
              </Text>
              {isActive && (
                <View style={styles.activeDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.divider} />

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.md }]}>
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>v1.0.0</Text>
      </View>
    </View>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDrawer,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  brandName: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
  },
  brandTagline: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: SPACING.xl,
  },
  menuScrollView: {
    flex: 1,
    paddingTop: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    letterSpacing: 1.5,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    marginHorizontal: SPACING.md,
    marginVertical: 2,
    borderRadius: RADIUS.md,
    position: 'relative',
    overflow: 'hidden',
  },
  menuItemActive: {
    backgroundColor: 'rgba(74, 194, 154, 0.08)',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(74, 194, 154, 0.15)',
  },
  menuLabel: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },
  menuLabelActive: {
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.semibold,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.brandGreen,
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    marginLeft: SPACING.sm,
  },
  versionText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    marginTop: SPACING.xs,
  },
});
