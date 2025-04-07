import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, CheckCircle, CreditCard, AlertTriangle } from "lucide-react-native";
import { useTheme } from "../_layout";
import PaymentOptions from "../components/PaymentOptions";
import {
  initiateTelebirrPayment,
  simulatePaymentVerification,
} from "../services/telebirr";
import { getApiBaseUrl } from "../services/apiUtils";
import SafeAreaContainer from "../utils/SafeAreaContainer";
import Typography from "../utils/typography";
import TelebirrWebView from "../components/TelebirrWebView";

const PaymentScreen = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const params = useLocalSearchParams();

  // Get booking details from params
  const price = params.price ? parseFloat(params.price as string) : 350;
  const pickup = (params.pickup as string) || "";
  const destination = (params.destination as string) || "";
  const truckType = (params.truckType as string) || "";

  const [paymentMethod, setPaymentMethod] = useState("telebirr");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [telebirrPaymentUrl, setTelebirrPaymentUrl] = useState<string | null>(null);
  const [outTradeNo, setOutTradeNo] = useState<string>("");
  
  // Add state for confirmation modal
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  const handlePaymentMethodChange = (methodId: string) => {
    setPaymentMethod(methodId);
    setPaymentError(null);
  };

  const generateOrderReference = () => {
    // Generate a unique order reference
    return `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };
  
  const handlePaymentButtonClick = () => {
    // Show confirmation modal before proceeding with payment
    setIsConfirmModalVisible(true);
  };

  const handlePayment = async () => {
    setIsConfirmModalVisible(false);
    
    if (paymentMethod === "cash") {
      // Handle cash payment (proceed directly to confirmation)
      setPaymentSuccess(true);
      setTransactionId(generateOrderReference());
      return;
    }

    // Handle Telebirr payment
    setIsProcessing(true);
    setPaymentError(null);

    try {
      const referenceId = generateOrderReference();
      setTransactionId(referenceId);

      console.log("Initiating payment with API URL:", `${getApiBaseUrl()}/payments/telebirr/create`);
      
      const response = await initiateTelebirrPayment({
        amount: price,
        referenceId,
        subject: `Truck Booking - ${truckType}`,
        customerName: "Customer", // In a real app, get from user profile
        customerPhone: "0911111111", // In a real app, get from user profile
      });

      if (response.success && response.data?.toPayUrl) {
        // Set the payment URL and show the WebView
        setTelebirrPaymentUrl(response.data.toPayUrl);
        if (response.data.outTradeNo) {
          setOutTradeNo(response.data.outTradeNo);
        }
      } else {
        console.error("Payment initiation failed:", response.message);
        setPaymentError(response.message || "Failed to initiate payment. Please check if the API is running.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentError("An unexpected error occurred. Please check the server connection and try again.");
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (outTradeNo: string) => {
    // Verify the payment status
    try {
      // In a real app, this would call the backend to verify the payment
      // For demo purposes, we'll use a mock implementation
      const verificationResult = await simulatePaymentVerification(outTradeNo);
      
      if (verificationResult.success) {
        setPaymentSuccess(true);
        setTelebirrPaymentUrl(null);
        setIsProcessing(false);
      } else {
        setPaymentError(verificationResult.message || "Payment verification failed");
        setTelebirrPaymentUrl(null);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Verification error:", error);
      setPaymentError("Failed to verify payment. Please contact support.");
      setTelebirrPaymentUrl(null);
      setIsProcessing(false);
    }
  };

  const handlePaymentFailure = (message: string) => {
    setPaymentError(message);
    setTelebirrPaymentUrl(null);
    setIsProcessing(false);
  };

  const handleContinue = () => {
    // Navigate to tracking screen or order confirmation
    router.push({
      pathname: "/customer/tracking",
      params: {
        orderId: transactionId || generateOrderReference(),
        paymentMethod,
      },
    });
  };

  return (
    <>
      {telebirrPaymentUrl && (
        <TelebirrWebView
          paymentUrl={telebirrPaymentUrl}
          outTradeNo={outTradeNo}
          onClose={() => {
            setTelebirrPaymentUrl(null);
            setIsProcessing(false);
          }}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentFailure={handlePaymentFailure}
        />
      )}
      
      <SafeAreaContainer extraPadding={{ top: 10 }}>
        <View className="mb-6 flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="pr-4"
          >
            <ArrowLeft size={24} color={isDarkMode ? "#ffffff" : "#374151"} />
          </TouchableOpacity>
          <Typography variant="h2">Payment</Typography>
        </View>

        {paymentSuccess ? (
          <View className={`p-6 rounded-lg shadow-sm items-center ${isDarkMode ? 'bg-neutral-800' : 'bg-white'}`}>
            <CheckCircle size={64} color="#10B981" />
            <Text className={`text-xl font-bold mt-4 ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
              Payment Successful!
            </Text>
            <Text className={`text-center mt-2 mb-6 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Your booking has been confirmed. You can now track your order.
            </Text>

            <View className={`w-full p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-neutral-700' : 'bg-gray-50'}`}>
              <View className="flex-row justify-between mb-2">
                <Text className={isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}>
                  Order ID
                </Text>
                <Text className={`font-medium ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
                  {transactionId || "N/A"}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className={isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}>
                  Payment Method
                </Text>
                <Text className={`font-medium ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
                  {paymentMethod === "telebirr"
                    ? "Telebirr"
                    : "Cash on Delivery"}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className={isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}>
                  Amount
                </Text>
                <Text className={`font-medium ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
                  {price.toFixed(2)} ETB
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="w-full py-3 bg-primary-500 rounded-lg items-center"
              onPress={handleContinue}
            >
              <Text className="text-white font-medium">Track Order</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View className="mb-6">
              <Text className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
                Order Summary
              </Text>
              <View className={`p-4 rounded-lg ${isDarkMode ? 'bg-neutral-800' : 'bg-white'}`}>
                <View className="flex-row justify-between mb-2">
                  <Text className={isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}>
                    Pickup
                  </Text>
                  <Text className={`font-medium ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
                    {pickup || "Bole, Addis Ababa"}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className={isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}>
                    Destination
                  </Text>
                  <Text className={`font-medium ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
                    {destination || "Megenagna, Addis Ababa"}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className={isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}>
                    Truck Type
                  </Text>
                  <Text className={`font-medium ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
                    {truckType || "Medium Truck"}
                  </Text>
                </View>
                <View className="border-t border-gray-200 dark:border-gray-700 my-2" />
                <View className="flex-row justify-between">
                  <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
                    Total
                  </Text>
                  <Text className={`font-bold ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
                    {price.toFixed(2)} ETB
                  </Text>
                </View>
              </View>
            </View>

            <View className="mb-6">
              <Text className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
                Payment Method
              </Text>
              <PaymentOptions
                selectedMethod={paymentMethod}
                onSelectMethod={handlePaymentMethodChange}
                amount={price}
                isProcessing={isProcessing}
                paymentError={paymentError}
              />
            </View>

            {paymentError && (
              <View className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Text className="text-red-600 dark:text-red-400">
                  {paymentError}
                </Text>
              </View>
            )}

            <TouchableOpacity
              className={`py-3 rounded-lg items-center ${
                isProcessing
                  ? "bg-gray-400 dark:bg-gray-700"
                  : "bg-primary-500"
              }`}
              onPress={handlePaymentButtonClick}
              disabled={isProcessing}
            >
              <Text className="text-white font-medium">
                {isProcessing ? "Processing..." : "Proceed to Payment"}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Payment Confirmation Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isConfirmModalVisible}
          onRequestClose={() => setIsConfirmModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[
              styles.modalContent,
              isDarkMode ? { backgroundColor: '#1f2937' } : { backgroundColor: '#ffffff' }
            ]}>
              <View style={styles.modalHeader}>
                <CreditCard size={24} color="#3b82f6" />
                <Text style={[
                  styles.modalTitle,
                  isDarkMode ? { color: '#ffffff' } : { color: '#374151' }
                ]}>
                  Confirm Payment
                </Text>
              </View>
              
              <Text style={[
                styles.modalMessage,
                isDarkMode ? { color: '#d1d5db' } : { color: '#4b5563' }
              ]}>
                You're about to make a payment of <Text style={styles.highlightText}>{price.toFixed(2)} ETB</Text> using{' '}
                <Text style={styles.highlightText}>
                  {paymentMethod === "telebirr" ? "Telebirr" : "Cash on Delivery"}
                </Text>. 
                Do you want to proceed?
              </Text>
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsConfirmModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handlePayment}
                >
                  <CheckCircle size={16} color="#ffffff" />
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaContainer>
    </>
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
  highlightText: {
    fontWeight: '700',
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
    backgroundColor: '#3b82f6',
    marginLeft: 8,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 6,
  },
});

export default PaymentScreen;
