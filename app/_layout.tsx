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

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a theme context to manage dark mode across the app
export type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Load theme preference from storage
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const themePreference = await AsyncStorage.getItem("themePreference");
        if (themePreference !== null) {
          setIsDarkMode(themePreference === "dark");
        }
      } catch (error) {
        console.log("Error loading theme preference", error);
      }
    };

    loadThemePreference();
  }, []);

  // Toggle theme function
  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem(
        "themePreference",
        newTheme ? "dark" : "light",
      );
    } catch (error) {
      console.log("Error saving theme preference", error);
    }
  };

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
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={({ route }) => ({
            headerShown: !route.name.startsWith("tempobook"),
            headerStyle: {
              backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
            },
            headerTintColor: isDarkMode ? "#ffffff" : "#1f2937",
            contentStyle: {
              backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
            },
          })}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="auth/phone-verification"
            options={{ title: "Phone Verification" }}
          />
          <Stack.Screen
            name="auth/profile-setup"
            options={{ title: "Complete Your Profile" }}
          />
          <Stack.Screen
            name="customer/dashboard"
            options={{ title: "Dashboard" }}
          />
          <Stack.Screen
            name="customer/booking"
            options={{ title: "Book a Truck" }}
          />
          <Stack.Screen
            name="customer/tracking"
            options={{ title: "Track Your Order" }}
          />
          <Stack.Screen
            name="driver/dashboard"
            options={{ title: "Driver Dashboard" }}
          />
          <Stack.Screen
            name="driver/job-details"
            options={{ title: "Job Details" }}
          />
          <Stack.Screen name="settings/index" options={{ title: "Settings" }} />
        </Stack>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
