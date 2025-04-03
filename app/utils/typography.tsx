import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

// Define typography variants
type TypographyVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'body' 
  | 'body-medium'
  | 'body-bold'
  | 'caption'
  | 'button';

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  children: React.ReactNode;
}

/**
 * Typography component that applies Inter font family consistently across the app.
 * 
 * Usage:
 * <Typography variant="h1">Hello World</Typography>
 * <Typography variant="body-medium">This is medium text</Typography>
 */
export const Typography: React.FC<TypographyProps> = ({ 
  variant = 'body',
  style,
  children,
  ...props 
}) => {
  return (
    <Text 
      style={[styles[variant], style]} 
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontFamily: 'Inter-Bold',
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    lineHeight: 32,
  },
  h3: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    lineHeight: 28,
  },
  h4: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    lineHeight: 24,
  },
  body: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  'body-medium': {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    lineHeight: 24,
  },
  'body-bold': {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
});

export default Typography; 