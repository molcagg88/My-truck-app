import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Add proper type definition for the Header component props
interface HeaderProps {
  title: string;
  rightComponent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, rightComponent }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {rightComponent && (
        <View style={styles.rightComponent}>
          {rightComponent}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  rightComponent: {
    marginLeft: 'auto',
  },
});

export default Header;
