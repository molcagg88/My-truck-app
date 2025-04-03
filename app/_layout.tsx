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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const toggleTheme = (darkMode: boolean) => {
    setIsDarkMode(darkMode);
    // Save theme preference
    AsyncStorage.setItem("themePreference", darkMode ? "dark" : "light").catch(error => {
      console.log("Error saving theme preference", error);
    });
  };

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
}
