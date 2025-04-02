import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Check, Clock, Truck, Package, MapPin } from "lucide-react-native";

interface OrderStatusTrackerProps {
  currentStatus?: "confirmed" | "pickup" | "in_transit" | "delivered";
  estimatedDeliveryTime?: string;
}

const OrderStatusTracker = ({
  currentStatus = "confirmed",
  estimatedDeliveryTime = "45 min",
}: OrderStatusTrackerProps) => {
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order Status</Text>
        <View style={styles.estimatedTime}>
          <Clock size={16} color="#FF3B30" />
          <Text style={styles.estimatedTimeText}>
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
                  isActive ? styles.activeIconContainer : {},
                ]}
              >
                <StatusIcon
                  size={16}
                  color={isActive ? "#FFFFFF" : "#9CA3AF"}
                />
              </View>

              {!isLast && (
                <View
                  style={[
                    styles.connector,
                    index < currentStatusIndex ? styles.activeConnector : {},
                  ]}
                />
              )}

              <Text
                style={[
                  styles.statusLabel,
                  isActive ? styles.activeStatusLabel : {},
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
    backgroundColor: "#FFFFFF",
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
    color: "#1F2937",
  },
  estimatedTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  estimatedTimeText: {
    fontSize: 14,
    color: "#4B5563",
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
    backgroundColor: "#E5E7EB",
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
    backgroundColor: "#E5E7EB",
    zIndex: 0,
  },
  activeConnector: {
    backgroundColor: "#FF3B30",
  },
  statusLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },
  activeStatusLabel: {
    color: "#1F2937",
    fontWeight: "600",
  },
});

export default OrderStatusTracker;
