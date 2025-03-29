import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ChevronDown, Phone, ArrowRight } from "lucide-react-native";

interface PhoneInputProps {
  onSubmit?: (phoneNumber: string) => void;
  initialCountryCode?: string;
  initialPhoneNumber?: string;
  isLoading?: boolean;
}

const PhoneInput = ({
  onSubmit = () => {},
  initialCountryCode = "+251", // Ethiopia country code
  initialPhoneNumber = "",
  isLoading = false,
}: PhoneInputProps) => {
  const [countryCode, setCountryCode] = useState(initialCountryCode);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [isCountryCodeOpen, setIsCountryCodeOpen] = useState(false);

  const handleSubmit = () => {
    if (phoneNumber.length >= 9) {
      onSubmit(`${countryCode}${phoneNumber}`);
    }
  };

  // Country codes for the dropdown (simplified for demo)
  const countryCodes = [
    { code: "+251", country: "Ethiopia" },
    { code: "+254", country: "Kenya" },
    { code: "+256", country: "Uganda" },
    { code: "+255", country: "Tanzania" },
  ];

  return (
    <View className="w-full bg-white p-4 rounded-lg shadow-sm">
      <Text className="text-gray-700 font-medium mb-2">
        Enter your phone number
      </Text>
      <View className="flex-row items-center mb-4">
        {/* Country code selector */}
        <TouchableOpacity
          className="flex-row items-center bg-gray-100 rounded-l-lg px-2 py-3 border-r border-gray-300"
          onPress={() => setIsCountryCodeOpen(!isCountryCodeOpen)}
        >
          <Text className="text-black font-medium mr-1">{countryCode}</Text>
          <ChevronDown size={16} color="#374151" />
        </TouchableOpacity>

        {/* Phone number input */}
        <View className="flex-row flex-1 items-center bg-gray-100 rounded-r-lg px-3 py-2">
          <Phone size={18} color="#374151" className="mr-2" />
          <TextInput
            className="flex-1 text-base text-black h-10"
            placeholder="9XX XXX XXXX"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            maxLength={10}
          />
        </View>
      </View>

      {/* Country code dropdown (simplified) */}
      {isCountryCodeOpen && (
        <View className="bg-white rounded-lg shadow-md mb-4 absolute top-20 left-4 z-10 w-48">
          {countryCodes.map((item) => (
            <TouchableOpacity
              key={item.code}
              className="px-4 py-3 border-b border-gray-100"
              onPress={() => {
                setCountryCode(item.code);
                setIsCountryCodeOpen(false);
              }}
            >
              <Text className="text-black">
                {item.country} ({item.code})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Submit button */}
      <TouchableOpacity
        className={`flex-row items-center justify-center rounded-lg py-3 px-4 ${phoneNumber.length >= 9 ? "bg-red-600" : "bg-gray-400"}`}
        onPress={handleSubmit}
        disabled={phoneNumber.length < 9 || isLoading}
      >
        <Text className="text-white font-medium mr-2">
          {isLoading ? "Sending code..." : "Send verification code"}
        </Text>
        {!isLoading && <ArrowRight size={18} color="white" />}
      </TouchableOpacity>

      <Text className="text-gray-500 text-xs mt-3 text-center">
        We'll send a verification code to this number via GeezSMS
      </Text>
    </View>
  );
};

export default PhoneInput;
