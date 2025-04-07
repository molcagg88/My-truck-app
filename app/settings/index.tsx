import React, { useState } from "react";
import { View, Text, TouchableOpacity, Switch, Modal, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Moon, Sun, Bell, Shield, HelpCircle, LogOut, AlertCircle } from "lucide-react-native";
import { useTheme } from "../_layout";
import SafeAreaContainer from "../utils/SafeAreaContainer";
import Typography from "../utils/typography";
import { useAuth } from "../auth/authContext";

const SettingsScreen = () => {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const handleLogoutPress = () => {
    setIsLogoutModalVisible(true);
  };

  const handleLogout = async () => {
    try {
      setIsLogoutModalVisible(false);
      await logout();
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    description, 
    right,
    onPress,
    isDestructive = false
  }: { 
    icon: any; 
    title: string; 
    description?: string;
    right?: React.ReactNode;
    onPress?: () => void;
    isDestructive?: boolean;
  }) => (
    <TouchableOpacity 
      className={`flex-row items-center p-4 border-b border-gray-200 dark:border-gray-800 ${onPress ? 'active:bg-gray-100 dark:active:bg-neutral-800' : ''}`}
      onPress={onPress}
      disabled={!onPress}
    >
      <View className="w-8 mr-4 items-center">
        <Icon size={22} color={isDestructive ? "#FF453A" : isDarkMode ? "#ffffff" : "#000000"} />
      </View>
      <View className="flex-1">
        <Text className={`font-medium text-base ${isDestructive ? "text-red-500" : "text-gray-900 dark:text-white"}`}>
          {title}
        </Text>
        {description && (
          <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {description}
          </Text>
        )}
      </View>
      {right}
    </TouchableOpacity>
  );

  return (
    <SafeAreaContainer extraPadding={{ top: 10 }}>
      <View className="mb-6 flex-row items-center">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="pr-4"
        >
          <ArrowLeft size={24} color={isDarkMode ? "#ffffff" : "#000000"} />
        </TouchableOpacity>
        <Typography variant="h2">Settings</Typography>
      </View>

      <View className="bg-white dark:bg-neutral-800 rounded-lg mb-6">
        <SettingItem
          icon={isDarkMode ? Sun : Moon}
          title="Dark Mode"
          description="Toggle between light and dark themes"
          right={
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: "#767577", true: "#FF3B30" }}
              thumbColor="#ffffff"
            />
          }
        />
        
        <SettingItem
          icon={Bell}
          title="Notifications"
          description="Manage notification preferences"
          onPress={() => {}}
        />
        
        <SettingItem
          icon={Shield}
          title="Privacy & Security"
          description="Manage your data and security options"
          onPress={() => {}}
        />
      </View>

      <View className="bg-white dark:bg-neutral-800 rounded-lg mb-6">
        <SettingItem
          icon={HelpCircle}
          title="Help & Support"
          description="Get help or contact support"
          onPress={() => {}}
        />
      </View>

      <View className="bg-white dark:bg-neutral-800 rounded-lg">
        <SettingItem
          icon={LogOut}
          title="Log Out"
          isDestructive={true}
          onPress={handleLogoutPress}
        />
      </View>

      <View className="mt-auto p-4 items-center">
        <Text className="text-gray-500 dark:text-gray-400 text-sm">
          Version 1.0.0
        </Text>
      </View>

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isLogoutModalVisible}
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            isDarkMode ? { backgroundColor: '#1f2937' } : { backgroundColor: '#ffffff' }
          ]}>
            <View style={styles.modalHeader}>
              <AlertCircle size={24} color="#f59e0b" />
              <Text style={[
                styles.modalTitle,
                isDarkMode ? { color: '#ffffff' } : { color: '#374151' }
              ]}>
                Confirm Logout
              </Text>
            </View>
            
            <Text style={[
              styles.modalMessage,
              isDarkMode ? { color: '#d1d5db' } : { color: '#4b5563' }
            ]}>
              Are you sure you want to log out of your account?
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsLogoutModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleLogout}
              >
                <LogOut size={16} color="#ffffff" />
                <Text style={styles.confirmButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaContainer>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 350,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  modalMessage: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#9ca3af',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#ef4444',
    marginLeft: 8,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 6,
  },
});

export default SettingsScreen;
