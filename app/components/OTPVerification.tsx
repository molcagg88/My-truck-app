import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

interface OTPVerificationProps {
  value?: string;
  onChange?: (value: string) => void;
  length?: number;
  onResend?: () => void;
}

const OTPVerification = ({
  value = "",
  onChange = () => {},
  length = 6,
  onResend = () => {},
}: OTPVerificationProps) => {
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleResend = () => {
    if (timer === 0) {
      onResend();
      setTimer(60);
    }
  };

  const handleChange = (text: string, index: number) => {
    const newValue = value.split("");
    newValue[index] = text;
    onChange(newValue.join(""));

    // Auto focus next input
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="w-full">
      <View className="flex-row justify-between mb-6">
        {Array(length)
          .fill(0)
          .map((_, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              className="w-12 h-14 text-center text-xl font-bold rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600"
              maxLength={1}
              keyboardType="number-pad"
              value={value[index] || ""}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
            />
          ))}
      </View>

      <View className="flex-row justify-center items-center">
        <Text className="text-gray-600 dark:text-gray-400">
          Didn't receive code?
        </Text>
        <TouchableOpacity 
          onPress={handleResend} 
          disabled={timer > 0}
          style={{ pointerEvents: 'auto' }}
        >
          <Text
            className={`ml-2 ${timer > 0 ? "text-gray-400 dark:text-gray-600" : "text-red-600"}`}
          >
            {timer > 0 ? `Resend in ${timer}s` : "Resend"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Remove unnecessary StyleSheet as we're using TailwindCSS/NativeWind classes
const styles = StyleSheet.create({});

export default OTPVerification;
