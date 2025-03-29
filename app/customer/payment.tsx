import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react-native";
import { useTheme } from "../_layout";
import PaymentOptions from "../components/PaymentOptions";
import {
  initiateTelebirrPayment,
  verifyTelebirrPayment,
} from "../services/telebirr";

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

  const handlePaymentMethodChange = (methodId: string) => {
    setPaymentMethod(methodId);
    setPaymentError(null);
  };

  const generateOrderReference = () => {
    // Generate a unique order reference
    return `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  const handlePayment = async () => {
    if (paymentMethod === "cash") {
      // Handle cash payment (proceed directly to confirmation)
      setPaymentSuccess(true);
      return;
    }

    // Handle Telebirr payment
    setIsProcessing(true);
    setPaymentError(null);

    try {
      const referenceId = generateOrderReference();
      setTransactionId(referenceId);

      const response = await initiateTelebirrPayment({
        amount: price + 25, // Total amount including service fee
        referenceId,
        subject: `Truck Booking - ${truckType}`,
        customerName: "Customer", // In a real app, get from user profile
        customerPhone: "0911111111", // In a real app, get from user profile
      });

      if (response.success && response.data?.toPayUrl) {
        // In a real mobile app, this would open the Telebirr app
        // For web/demo, we'll simulate the payment verification

        // Simulate opening Telebirr app
        Alert.alert(
          "Opening Telebirr",
          "In a real app, this would open the Telebirr app for payment. For this demo, we'll simulate the payment process.",
          [
            {
              text: "OK",
              onPress: () => verifyPayment(response.data?.outTradeNo || ""),
            },
          ],
        );
      } else {
        setPaymentError(response.message || "Failed to initiate payment");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentError("An unexpected error occurred. Please try again.");
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (outTradeNo: string) => {
    try {
      // In a real app, this would be called when the user returns from Telebirr app
      // or via a webhook notification from Telebirr

      const verificationResult = await verifyTelebirrPayment(outTradeNo);

      if (verificationResult.success) {
        setPaymentSuccess(true);
      } else {
        setPaymentError(
          "Payment verification failed. Please try again or choose another payment method.",
        );
      }
    } catch (error) {
      console.error("Verification error:", error);
      setPaymentError("Failed to verify payment. Please contact support.");
    } finally {
      setIsProcessing(false);
    }
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
    <ScrollView className="flex-1 bg-gray-50 dark:bg-neutral-900">
      <View className="p-4">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <ArrowLeft size={24} color={isDarkMode ? "#ffffff" : "#374151"} />
        </TouchableOpacity>

        <Text className="text-2xl font-bold mb-6 text-neutral-800 dark:text-white">
          Payment
        </Text>

        {paymentSuccess ? (
          <View className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm items-center">
            <CheckCircle size={64} color="#10B981" />
            <Text className="text-xl font-bold mt-4 text-neutral-800 dark:text-white">
              Payment Successful!
            </Text>
            <Text className="text-center text-neutral-600 dark:text-neutral-400 mt-2 mb-6">
              Your booking has been confirmed. You can now track your order.
            </Text>

            <View className="w-full p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="text-neutral-600 dark:text-neutral-400">
                  Order ID
                </Text>
                <Text className="font-medium text-neutral-800 dark:text-white">
                  {transactionId || "N/A"}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-neutral-600 dark:text-neutral-400">
                  Payment Method
                </Text>
                <Text className="font-medium text-neutral-800 dark:text-white">
                  {paymentMethod === "telebirr"
                    ? "Telebirr"
                    : "Cash on Delivery"}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-neutral-600 dark:text-neutral-400">
                  Amount
                </Text>
                <Text className="font-medium text-neutral-800 dark:text-white">
                  {(price + 25).toFixed(2)} ETB
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleContinue}
              className="w-full py-4 bg-primary-500 rounded-lg"
            >
              <Text className="text-white font-semibold text-center">
                Track Your Order
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View className="mb-6">
              <Text className="text-lg font-semibold mb-2 text-neutral-800 dark:text-white">
                Booking Summary
              </Text>
              <View className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-neutral-600 dark:text-neutral-400">
                    Pickup
                  </Text>
                  <Text className="font-medium text-neutral-800 dark:text-white">
                    {pickup || "Not specified"}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-neutral-600 dark:text-neutral-400">
                    Destination
                  </Text>
                  <Text className="font-medium text-neutral-800 dark:text-white">
                    {destination || "Not specified"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-neutral-600 dark:text-neutral-400">
                    Truck Type
                  </Text>
                  <Text className="font-medium text-neutral-800 dark:text-white">
                    {truckType || "Not specified"}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mb-6">
              <PaymentOptions
                onSelectMethod={handlePaymentMethodChange}
                selectedMethod={paymentMethod}
                amount={price}
                isProcessing={isProcessing}
                paymentError={paymentError}
              />
            </View>

            <TouchableOpacity
              onPress={handlePayment}
              disabled={isProcessing}
              className={`py-4 rounded-lg ${isProcessing ? "bg-neutral-400 dark:bg-neutral-700" : "bg-primary-500"}`}
            >
              <Text className="text-white font-semibold text-center">
                {paymentMethod === "telebirr"
                  ? "Pay with Telebirr"
                  : "Confirm Order"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default PaymentScreen;
