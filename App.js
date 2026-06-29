import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

function MainApp() {
  const { isDark } = useTheme();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'RFiberX needs access to your GPS location to save client installation coordinates. Please enable location access in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert(
          'GPS is Disabled',
          'Your phone\'s Location/GPS is currently turned off. Please swipe down from the top of your screen and turn on Location so RFiberX can save client coordinates.',
          [{ text: 'OK' }]
        );
      }
    })();
  }, []);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
