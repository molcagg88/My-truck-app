import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { createContext, useContext, useEffect, useState } from "react";
import "react-native-reanimated";
import "../global.css";
import { Platform, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthProvider } from "./auth/authContext";
import { useTheme as useAppTheme } from "./_layout";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a theme context to manage dark mode across the app
export type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: (isDarkMode: boolean) => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export default function RootLayout() {
  const { isDarkMode, toggleTheme } = useAppTheme();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Load theme preference from storage
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const themePreference = await AsyncStorage.getItem("themePreference");
        if (themePreference !== null) {
          toggleTheme(themePreference === "dark");
        }
      } catch (error) {
        console.log("Error loading theme preference", error);
      }
    };

    loadThemePreference();
  }, [toggleTheme]);

  useEffect(() => {
    // Sync system theme with app theme
    if (colorScheme) {
      toggleTheme(colorScheme === 'dark');
    }
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

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
        <ThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              },
              headerTintColor: isDarkMode ? '#ffffff' : '#000000',
              headerTitleStyle: {
                fontWeight: 'bold',
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
              name="auth/register"
              options={{
                title: "Register",
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
              name="auth/verify-email"
              options={{
                title: "Verify Email",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="auth/forgot-password"
              options={{
                title: "Forgot Password",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="auth/reset-password"
              options={{
                title: "Reset Password",
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
              name="customer/profile"
              options={{
                title: "Profile",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="customer/settings"
              options={{
                title: "Settings",
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
              name="driver/profile"
              options={{
                title: "Profile",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="driver/settings"
              options={{
                title: "Settings",
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
              name="settings"
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
}
