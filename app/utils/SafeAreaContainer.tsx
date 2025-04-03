import React from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, Platform, StatusBar, RefreshControl, Text, TextStyle } from 'react-native';
import { useTheme } from '../_layout';

interface SafeAreaContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
  extraPadding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  refreshControl?: React.ReactElement;
}

// Default text styles with Inter font family
export const textStyles = StyleSheet.create({
  base: {
    fontFamily: 'Inter-Regular',
  },
  medium: {
    fontFamily: 'Inter-Medium',
  },
  bold: {
    fontFamily: 'Inter-Bold',
  },
});

/**
 * A container component that provides safe area insets and consistent margins
 * across all screens in the app.
 */
export const SafeAreaContainer: React.FC<SafeAreaContainerProps> = ({
  children,
  scrollable = true,
  edges = ['top', 'right', 'bottom', 'left'],
  extraPadding = {},
  refreshControl
}) => {
  const { isDarkMode } = useTheme();
  
  // Base padding values
  const basePadding = {
    top: 16 + (Platform.OS === 'ios' ? 30 : 20), // Extra top padding for notch
    right: 16,
    bottom: 16,
    left: 16
  };

  // Add any extra padding
  const padding = {
    top: (extraPadding.top || 0) + basePadding.top,
    right: (extraPadding.right || 0) + basePadding.right,
    bottom: (extraPadding.bottom || 0) + basePadding.bottom,
    left: (extraPadding.left || 0) + basePadding.left
  };

  // Create padding style based on requested edges
  const paddingStyle = {
    paddingTop: edges.includes('top') ? padding.top : 0,
    paddingRight: edges.includes('right') ? padding.right : 0,
    paddingBottom: edges.includes('bottom') ? padding.bottom : 0,
    paddingLeft: edges.includes('left') ? padding.left : 0,
  };

  // Generate dynamic style based on dark mode
  const containerStyle = {
    ...paddingStyle,
    backgroundColor: isDarkMode ? '#171717' : '#f9fafb',
    flex: 1,
  };

  // Render either a ScrollView or a regular View based on the scrollable prop
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#171717' : '#f9fafb' }}>
      <StatusBar
        backgroundColor={isDarkMode ? '#171717' : '#f9fafb'}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      {scrollable ? (
        <ScrollView
          style={containerStyle}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={containerStyle}>{children}</View>
      )}
    </SafeAreaView>
  );
};

export default SafeAreaContainer; 