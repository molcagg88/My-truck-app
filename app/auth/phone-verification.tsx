import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import PhoneInput from "../components/PhoneInput";
import OTPVerification from "../components/OTPVerification";
import { useTheme } from "../_layout";

const PhoneVerification = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otpCode, setOtpCode] = useState("");

  const handlePhoneSubmit = () => {
    if (phoneNumber.length >= 9) {
      // In a real app, you would send the OTP here
      console.log("Sending OTP to", phoneNumber);
      setStep("otp");
    }
  };

  const handleOTPSubmit = () => {
    if (otpCode.length === 6) {
      // In a real app, you would verify the OTP here
      console.log("Verifying OTP", otpCode);
      router.push("/auth/profile-setup");
    }
  };

  const handleResendOTP = () => {
    // In a real app, you would resend the OTP here
    console.log("Resending OTP to", phoneNumber);
  };

  const handleBack = () => {
    if (step === "otp") {
      setStep("phone");
    } else {
      router.back();
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-neutral-900"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 p-6">
        <TouchableOpacity onPress={handleBack} className="mb-6">
          <ArrowLeft size={24} color={isDarkMode ? "#ffffff" : "#374151"} />
        </TouchableOpacity>

        <View className="mb-8">
          <Text className="text-3xl font-bold mb-2 text-neutral-800 dark:text-white">
            {step === "phone" ? "Enter your phone" : "Verify your number"}
          </Text>
          <Text className="text-neutral-600 dark:text-neutral-400">
            {step === "phone"
              ? "We'll send you a verification code"
              : `We've sent a verification code to ${phoneNumber}`}
          </Text>
        </View>

        {step === "phone" ? (
          <PhoneInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="9XX XXX XXX"
            countryCode="+251"
          />
        ) : (
          <OTPVerification
            value={otpCode}
            onChange={setOtpCode}
            length={6}
            onResend={handleResendOTP}
          />
        )}

        <View className="mt-8">
          <TouchableOpacity
            onPress={step === "phone" ? handlePhoneSubmit : handleOTPSubmit}
            className={`flex-row items-center justify-center py-4 px-6 rounded-lg ${(step === "phone" && phoneNumber.length < 9) || (step === "otp" && otpCode.length < 6) ? "bg-neutral-300 dark:bg-neutral-700" : "bg-primary-500"}`}
            disabled={
              (step === "phone" && phoneNumber.length < 9) ||
              (step === "otp" && otpCode.length < 6)
            }
          >
            <Text className="text-white font-semibold mr-2">
              {step === "phone" ? "Continue" : "Verify"}
            </Text>
            <ArrowRight size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View className="mt-6 items-center">
          <Text className="text-neutral-500 dark:text-neutral-400 text-sm">
            By continuing, you agree to our
          </Text>
          <View className="flex-row">
            <TouchableOpacity>
              <Text className="text-primary-500 text-sm">Terms of Service</Text>
            </TouchableOpacity>
            <Text className="text-neutral-500 dark:text-neutral-400 text-sm mx-1">
              and
            </Text>
            <TouchableOpacity>
              <Text className="text-primary-500 text-sm">Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default PhoneVerification;
