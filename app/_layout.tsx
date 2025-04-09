import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import "react-native-reanimated";
import "../global.css";
import { Platform, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthProvider } from "./auth/authContext";
import { initSentry } from './services/sentry';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://9bfcd75eddfb9d73f4c8d811215f229d@o4509122361556992.ingest.de.sentry.io/4509122363392080',

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create theme context
type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
});

// Custom hook to use theme
export const useTheme = () => useContext(ThemeContext);

export default Sentry.wrap(function RootLayout() {
  // Get device color scheme
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [loaded] = useFonts({
    'Inter-Regular': require("../assets/fonts/inter/Inter-Regular.ttf"),
    'Inter-Medium': require("../assets/fonts/inter/Inter-Medium.ttf"),
    'Inter-Bold': require("../assets/fonts/inter/Inter-Bold.ttf"),
  });

  // Update dark mode if system preference changes
  useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);
  
  // Toggle theme manually
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };
  
  // Memoize theme values
  const themeContext = useMemo(
    () => ({
      isDarkMode,
      toggleTheme,
    }),
    [isDarkMode]
  );

  // Load theme preference from storage
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const themePreference = await AsyncStorage.getItem("themePreference");
        if (themePreference !== null) {
          setIsDarkMode(themePreference === "dark");
        } else if (colorScheme) {
          // If no saved preference, use system theme
          setIsDarkMode(colorScheme === 'dark');
        }
      } catch (error) {
        console.log("Error loading theme preference", error);
      }
    };

    loadThemePreference();
  }, [colorScheme]);

  useEffect(() => {
    if (process.env.EXPO_PUBLIC_TEMPO && Platform.OS === "web") {
      const { TempoDevtools } = require("tempo-devtools");
      TempoDevtools.init();
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Initialize Sentry
  useEffect(() => {
    initSentry();
  }, []);

  if (!loaded) {
    return null;
  }

  // Create modified themes with Inter font
  const customLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
    },
  };

  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
    },
  };

  return (
    <AuthProvider>
      <ThemeContext.Provider value={themeContext}>
        <ThemeProvider value={isDarkMode ? customDarkTheme : customLightTheme}>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
              },
              headerTintColor: isDarkMode ? '#f8fafc' : '#0f172a',
              headerTitleStyle: {
                fontFamily: 'Inter-Bold',
                fontWeight: 'bold',
              },
              contentStyle: {
                backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9',
              },
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                title: "My Truck",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="auth/login"
              options={{
                title: "Login",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="auth/profile-setup"
              options={{
                title: "Profile Setup",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="auth/phone-verification"
              options={{
                title: "Phone Verification",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="customer/dashboard"
              options={{
                title: "Customer Dashboard",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="customer/booking"
              options={{
                title: "Book a Truck",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="customer/payment"
              options={{
                title: "Payment",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="customer/tracking"
              options={{
                title: "Track Order",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="customer/rating"
              options={{
                title: "Rate Service",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="driver/dashboard"
              options={{
                title: "Driver Dashboard",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="driver/job-details"
              options={{
                title: "Job Details",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="notifications"
              options={{
                title: "Notifications",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="settings/index"
              options={{
                title: "Settings",
                headerShown: false,
              }}
            />
          </Stack>
          <StatusBar style={isDarkMode ? "light" : "dark"} />
        </ThemeProvider>
      </ThemeContext.Provider>
    </AuthProvider>
  );
});