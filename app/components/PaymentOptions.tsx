import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import {
  Check,
  ChevronRight,
  CreditCard,
  Wallet,
  AlertCircle,
} from "lucide-react-native";

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface PaymentOptionsProps {
  onSelectMethod?: (methodId: string) => void;
  selectedMethod?: string;
  amount?: number;
  isProcessing?: boolean;
  paymentError?: string | null;
}

const PaymentOptions = ({
  onSelectMethod = () => {},
  selectedMethod = "telebirr",
  amount = 350.0,
  isProcessing = false,
  paymentError = null,
}: PaymentOptionsProps) => {
  const [selected, setSelected] = useState(selectedMethod);

  const paymentMethods: PaymentMethod[] = [
    {
      id: "telebirr",
      name: "Telebirr",
      icon: <Wallet size={24} color="#E53935" />,
      description: "Pay directly with your Telebirr account",
    },
    {
      id: "cash",
      name: "Pay on Delivery",
      icon: <CreditCard size={24} color="#333" />,
      description: "Pay cash when your delivery arrives",
    },
  ];

  const handleSelect = (methodId: string) => {
    if (isProcessing) return; // Prevent changing payment method while processing
    setSelected(methodId);
    onSelectMethod(methodId);
  };

  return (
    <View className="bg-white p-4 rounded-lg shadow-sm">
      <Text className="text-lg font-bold mb-4">Payment Method</Text>

      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          className={`flex-row items-center p-3 mb-2 border rounded-lg ${isProcessing ? "opacity-70" : ""} ${selected === method.id ? "border-red-500 bg-red-50" : "border-gray-200"}`}
          onPress={() => handleSelect(method.id)}
          disabled={isProcessing}
        >
          <View className="w-8 h-8 justify-center items-center mr-3">
            {method.icon}
          </View>

          <View className="flex-1">
            <Text className="font-semibold text-base">{method.name}</Text>
            <Text className="text-gray-500 text-sm">{method.description}</Text>
          </View>

          <View className="w-6 h-6 justify-center items-center">
            {selected === method.id ? (
              <View className="w-5 h-5 rounded-full bg-red-500 justify-center items-center">
                <Check size={14} color="white" />
              </View>
            ) : (
              <ChevronRight size={18} color="#9CA3AF" />
            )}
          </View>
        </TouchableOpacity>
      ))}

      {paymentError && (
        <View className="mt-2 p-3 bg-red-50 rounded-lg flex-row items-center">
          <AlertCircle size={18} color="#EF4444" />
          <Text className="ml-2 text-red-600">{paymentError}</Text>
        </View>
      )}

      {isProcessing && (
        <View className="mt-2 p-3 bg-blue-50 rounded-lg flex-row items-center justify-center">
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text className="ml-2 text-blue-600">Processing payment...</Text>
        </View>
      )}

      <View className="mt-4 p-3 bg-gray-50 rounded-lg">
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-500">Subtotal</Text>
          <Text className="font-medium">{amount.toFixed(2)} ETB</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-500">Service Fee</Text>
          <Text className="font-medium">25.00 ETB</Text>
        </View>
        <View className="h-px bg-gray-200 my-2" />
        <View className="flex-row justify-between">
          <Text className="font-bold">Total</Text>
          <Text className="font-bold text-red-500">
            {(amount + 25).toFixed(2)} ETB
          </Text>
        </View>
      </View>
    </View>
  );
};

export default PaymentOptions;
