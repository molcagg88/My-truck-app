import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { useColorScheme } from "react-native";
import { X } from "lucide-react-native";

interface BidResponseModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onCounterBid: (amount: number) => void;
  currentBid: number;
  originalPrice: number;
}

const BidResponseModal: React.FC<BidResponseModalProps> = ({
  visible,
  onClose,
  onAccept,
  onDecline,
  onCounterBid,
  currentBid,
  originalPrice,
}) => {
  const colorScheme = useColorScheme();
  const [showCounterBid, setShowCounterBid] = useState(false);
  const [counterBidAmount, setCounterBidAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCounterBid = () => {
    const amount = parseFloat(counterBidAmount);
    if (isNaN(amount) || amount <= currentBid || amount >= originalPrice) {
      Alert.alert(
        "Invalid Amount",
        `Please enter an amount between ${currentBid.toLocaleString()} ETB and ${originalPrice.toLocaleString()} ETB.`
      );
      return;
    }
    onCounterBid(amount);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: colorScheme === "dark" ? "#1F2937" : "#FFFFFF",
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text
              style={[
                styles.modalTitle,
                {
                  color: colorScheme === "dark" ? "#F3F4F6" : "#111827",
                },
              ]}
            >
              Respond to Bid
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colorScheme === "dark" ? "#9CA3AF" : "#6B7280"} />
            </TouchableOpacity>
          </View>

          <View style={styles.bidInfo}>
            <Text
              style={[
                styles.bidLabel,
                { color: colorScheme === "dark" ? "#9CA3AF" : "#6B7280" },
              ]}
            >
              Driver's Bid
            </Text>
            <Text
              style={[
                styles.bidAmount,
                { color: colorScheme === "dark" ? "#F3F4F6" : "#111827" },
              ]}
            >
              {currentBid.toLocaleString()} ETB
            </Text>
          </View>

          {!showCounterBid ? (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.acceptButton]}
                onPress={onAccept}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>Accept Bid</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.declineButton]}
                onPress={onDecline}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.counterButton]}
                onPress={() => setShowCounterBid(true)}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>Counter Bid</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.counterBidContainer}>
              <Text
                style={[
                  styles.counterBidLabel,
                  { color: colorScheme === "dark" ? "#9CA3AF" : "#6B7280" },
                ]}
              >
                Enter your counter bid
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colorScheme === "dark" ? "#374151" : "#F3F4F6",
                    color: colorScheme === "dark" ? "#F3F4F6" : "#111827",
                  },
                ]}
                value={counterBidAmount}
                onChangeText={setCounterBidAmount}
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor={colorScheme === "dark" ? "#9CA3AF" : "#6B7280"}
              />
              <View style={styles.counterBidButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setShowCounterBid(false)}
                  disabled={isSubmitting}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleCounterBid}
                  disabled={isSubmitting}
                >
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  bidInfo: {
    alignItems: "center",
    marginBottom: 24,
  },
  bidLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  bidAmount: {
    fontSize: 24,
    fontWeight: "600",
  },
  actionButtons: {
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#10B981",
  },
  declineButton: {
    backgroundColor: "#EF4444",
  },
  counterButton: {
    backgroundColor: "#F59E0B",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  counterBidContainer: {
    gap: 16,
  },
  counterBidLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  counterBidButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#6B7280",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#3B82F6",
  },
});

export default BidResponseModal; 