import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Check, Clock, Truck, Package, MapPin } from "lucide-react-native";
import { useTheme } from "../_layout";

interface OrderStatusTrackerProps {
  currentStatus?: "confirmed" | "pickup" | "in_transit" | "delivered";
  estimatedDeliveryTime?: string;
}

const OrderStatusTracker = ({
  currentStatus = "confirmed",
  estimatedDeliveryTime = "45 min",
}: OrderStatusTrackerProps) => {
  const { isDarkMode } = useTheme();
  
  const statuses = [
    { id: "confirmed", label: "Confirmed", icon: Check },
    { id: "pickup", label: "Pickup", icon: Package },
    { id: "in_transit", label: "In Transit", icon: Truck },
    { id: "delivered", label: "Delivered", icon: MapPin },
  ];

  // Find the index of the current status
  const currentStatusIndex = statuses.findIndex(
    (status) => status.id === currentStatus,
  );

  // Dynamic styles based on theme
  const dynamicStyles = {
    container: {
      backgroundColor: isDarkMode ? '#262626' : '#FFFFFF',
      borderColor: isDarkMode ? '#404040' : '#E5E7EB',
      borderWidth: 1,
    },
    title: {
      color: isDarkMode ? '#FFFFFF' : '#1F2937',
    },
    estimatedTimeText: {
      color: isDarkMode ? '#D1D5DB' : '#4B5563',
    },
    iconContainer: {
      backgroundColor: isDarkMode ? '#525252' : '#E5E7EB',
    },
    connector: {
      backgroundColor: isDarkMode ? '#525252' : '#E5E7EB',
    },
    statusLabel: {
      color: isDarkMode ? '#9CA3AF' : '#6B7280',
    },
    activeStatusLabel: {
      color: isDarkMode ? '#FFFFFF' : '#1F2937',
    },
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <View style={styles.header}>
        <Text style={[styles.title, dynamicStyles.title]}>Order Status</Text>
        <View style={styles.estimatedTime}>
          <Clock size={16} color="#FF3B30" />
          <Text style={[styles.estimatedTimeText, dynamicStyles.estimatedTimeText]}>
            ETA: {estimatedDeliveryTime}
          </Text>
        </View>
      </View>

      <View style={styles.statusContainer}>
        {statuses.map((status, index) => {
          const StatusIcon = status.icon;
          const isActive = index <= currentStatusIndex;
          const isLast = index === statuses.length - 1;

          return (
            <View key={status.id} style={styles.statusItem}>
              <View
                style={[
                  styles.iconContainer,
                  dynamicStyles.iconContainer,
                  isActive ? styles.activeIconContainer : {},
                ]}
              >
                <StatusIcon
                  size={16}
                  color={isActive ? "#FFFFFF" : isDarkMode ? "#9CA3AF" : "#6B7280"}
                />
              </View>

              {!isLast && (
                <View
                  style={[
                    styles.connector,
                    dynamicStyles.connector,
                    index < currentStatusIndex ? styles.activeConnector : {},
                  ]}
                />
              )}

              <Text
                style={[
                  styles.statusLabel,
                  dynamicStyles.statusLabel,
                  isActive ? [styles.activeStatusLabel, dynamicStyles.activeStatusLabel] : {},
                ]}
              >
                {status.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  estimatedTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  estimatedTimeText: {
    fontSize: 14,
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    paddingVertical: 8,
  },
  statusItem: {
    alignItems: "center",
    position: "relative",
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    zIndex: 1,
  },
  activeIconContainer: {
    backgroundColor: "#FF3B30",
  },
  connector: {
    position: "absolute",
    top: 16,
    right: -50,
    width: 100,
    height: 2,
    zIndex: 0,
  },
  activeConnector: {
    backgroundColor: "#FF3B30",
  },
  statusLabel: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  activeStatusLabel: {
    fontWeight: "600",
  },
});

export default OrderStatusTracker;
