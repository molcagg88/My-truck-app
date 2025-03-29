import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import PhoneInput from "../components/PhoneInput";
import OTPVerification from "../components/OTPVerification";
import { useTheme } from "../_layout";
import { sendOTP, verifyOTP } from "../services/geezSMS";

const PhoneVerification = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+251");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhoneSubmit = async () => {
    if (phoneNumber.length >= 9) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await sendOTP({ phoneNumber: `${countryCode}${phoneNumber}` });
        if (response.success) {
          setStep("otp");
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError("Failed to send OTP. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOTPSubmit = async () => {
    if (otpCode.length === 6) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await verifyOTP({ 
          phoneNumber: `${countryCode}${phoneNumber}`, 
          otpCode 
        });
        if (response.success && response.data?.isValid) {
          router.push("/auth/profile-setup");
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError("Failed to verify OTP. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await sendOTP({ phoneNumber: `${countryCode}${phoneNumber}` });
      if (!response.success) {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "otp") {
      setStep("phone");
      setOtpCode("");
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
              : `We've sent a verification code to ${countryCode}${phoneNumber}`}
          </Text>
        </View>

        {error && (
          <View className="mb-4 p-4 bg-red-100 dark:bg-red-900 rounded-lg">
            <Text className="text-red-600 dark:text-red-200">{error}</Text>
          </View>
        )}

        {step === "phone" ? (
          <PhoneInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="9XX XXX XXX"
            countryCode={countryCode}
            onCountryCodeChange={setCountryCode}
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
            className={`flex-row items-center justify-center py-4 px-6 rounded-lg ${
              (step === "phone" && phoneNumber.length < 9) ||
              (step === "otp" && otpCode.length < 6) ||
              isLoading
                ? "bg-neutral-300 dark:bg-neutral-700"
                : "bg-primary-500"
            }`}
            disabled={
              (step === "phone" && phoneNumber.length < 9) ||
              (step === "otp" && otpCode.length < 6) ||
              isLoading
            }
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text className="text-white font-semibold mr-2">
                  {step === "phone" ? "Continue" : "Verify"}
                </Text>
                <ArrowRight size={20} color="#ffffff" />
              </>
            )}
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
