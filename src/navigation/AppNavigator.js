import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Header from '../components/Header';
import DrawerContent from '../components/DrawerContent';
import DashboardScreen from '../screens/DashboardScreen';
import ClientsScreen from '../screens/ClientsScreen';
import AddClientScreen from '../screens/AddClientScreen';
import SelectPlanScreen from '../screens/SelectPlanScreen';
import PaymentScreen from '../screens/PaymentScreen';
import AccountScreen from '../screens/AccountScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PlansScreen from '../screens/PlansScreen';
import BillingScreen from '../screens/BillingScreen';

import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import SplashScreen from '../screens/SplashScreen';

import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../constants/colors';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function ScreenWithHeader({ navigation, children, title }) {
  return (
    <>
      <Header
        onMenuPress={() => navigation.openDrawer()}
        onAccountPress={() => navigation.navigate('Account')}
        title={title}
      />
      {children}
    </>
  );
}

// Wrapper HOC to inject Header into each screen
function withHeader(ScreenComponent, screenTitle) {
  return function WrappedScreen(props) {
    return (
      <ScreenWithHeader navigation={props.navigation} title={screenTitle}>
        <ScreenComponent {...props} />
      </ScreenWithHeader>
    );
  };
}

const DashboardWithHeader = withHeader(DashboardScreen, '');
const ClientsWithHeader = withHeader(ClientsScreen, 'Clients');
const SelectPlanWithHeader = withHeader(SelectPlanScreen, 'Select Plan');
const AddClientWithHeader = withHeader(AddClientScreen, 'New Client');
const AccountWithHeader = withHeader(AccountScreen, 'Account');
const PlansWithHeader = withHeader(PlansScreen, 'Plans');
const SettingsWithHeader = withHeader(SettingsScreen, 'Settings');
const BillingWithHeader = withHeader(BillingScreen, 'Billing');

export default function AppNavigator() {
  const { colors: themeColors } = useTheme();
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@rfiberx_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load user', e);
      } finally {
        setIsInitializing(false);
      }
    };
    checkLogin();
  }, []);

  const handleLogin = async (userData) => {
    try {
      await AsyncStorage.setItem('@rfiberx_user', JSON.stringify(userData));
      setUser(userData);
    } catch (e) {
      console.error('Failed to save user', e);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@rfiberx_user');
      setUser(null);
    } catch (e) {
      console.error('Failed to remove user', e);
    }
  };

  if (isInitializing) {
    return <SplashScreen />;
  }

  const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login">
        {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
      </Stack.Screen>
      <Stack.Screen name="Signup">
        {(props) => <SignupScreen {...props} onLogin={handleLogin} />}
      </Stack.Screen>
    </Stack.Navigator>
  );

  const MainDrawer = () => (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} user={user} onLogout={handleLogout} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: 280,
          backgroundColor: themeColors.bgDrawer,
        },
        sceneContainerStyle: {
          backgroundColor: themeColors.bgPrimary,
        },
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardWithHeader} />
      <Drawer.Screen name="Clients" component={ClientsWithHeader} />
      <Drawer.Screen name="SelectPlan" component={SelectPlanWithHeader} />
      <Drawer.Screen name="AddClient" component={AddClientWithHeader} />
      <Drawer.Screen name="Payment" component={PaymentScreen} />
      <Drawer.Screen name="Account" component={AccountWithHeader} />
      <Drawer.Screen name="Plans" component={PlansWithHeader} />
      <Drawer.Screen name="Billing" component={BillingWithHeader} />
      <Drawer.Screen name="Settings" component={SettingsWithHeader} />
    </Drawer.Navigator>
  );

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {user ? <MainDrawer /> : <AuthStack />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
