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
import { useTheme } from "../_layout";

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
  const { isDarkMode } = useTheme();

  const paymentMethods: PaymentMethod[] = [
    {
      id: "telebirr",
      name: "Telebirr",
      icon: <Wallet size={24} color="#FF3B30" />,
      description: "Pay directly with your Telebirr account",
    },
    {
      id: "cash",
      name: "Pay on Delivery",
      icon: <CreditCard size={24} color={isDarkMode ? "#ffffff" : "#333333"} />,
      description: "Pay cash when your delivery arrives",
    },
  ];

  const handleSelect = (methodId: string) => {
    if (isProcessing) return; // Prevent changing payment method while processing
    setSelected(methodId);
    onSelectMethod(methodId);
  };

  return (
    <View className={`p-4 rounded-lg shadow-sm ${isDarkMode ? 'bg-neutral-800' : 'bg-white'}`}>
      <Text className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
        Payment Method
      </Text>

      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          className={`flex-row items-center p-3 mb-2 border rounded-lg ${isProcessing ? "opacity-70" : ""} 
            ${selected === method.id 
              ? isDarkMode
                ? "border-red-500 bg-red-900/30"
                : "border-red-500 bg-red-50" 
              : isDarkMode
                ? "border-neutral-700 bg-neutral-700"
                : "border-gray-200 bg-white"
            }`}
          onPress={() => handleSelect(method.id)}
          disabled={isProcessing}
        >
          <View className="w-8 h-8 justify-center items-center mr-3">
            {method.icon}
          </View>

          <View className="flex-1">
            <Text className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
              {method.name}
            </Text>
            <Text className={`text-sm ${isDarkMode ? 'text-neutral-300' : 'text-gray-500'}`}>
              {method.description}
            </Text>
          </View>

          <View className="w-6 h-6 justify-center items-center">
            {selected === method.id ? (
              <View className="w-5 h-5 rounded-full bg-red-500 justify-center items-center">
                <Check size={14} color="white" />
              </View>
            ) : (
              <ChevronRight size={18} color={isDarkMode ? "#9CA3AF" : "#6B7280"} />
            )}
          </View>
        </TouchableOpacity>
      ))}

      {paymentError && (
        <View className={`mt-2 p-3 rounded-lg flex-row items-center ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
          <AlertCircle size={18} color="#EF4444" />
          <Text className="ml-2 text-red-500 font-medium">{paymentError}</Text>
        </View>
      )}

      {isProcessing && (
        <View className={`mt-2 p-3 rounded-lg flex-row items-center justify-center ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
          <ActivityIndicator size="small" color={isDarkMode ? "#60A5FA" : "#3B82F6"} />
          <Text className={`ml-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} font-medium`}>
            Processing payment...
          </Text>
        </View>
      )}

      <View className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-neutral-700' : 'bg-gray-50'}`}>
        <View className="flex-row justify-between">
          <Text className={`font-bold ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>Total</Text>
          <Text className="font-bold text-red-500">
            {amount.toFixed(2)} ETB
          </Text>
        </View>
      </View>
    </View>
  );
};

export default PaymentOptions;
