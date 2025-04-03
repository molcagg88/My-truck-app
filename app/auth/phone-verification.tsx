import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import PhoneInput from "../components/PhoneInput";
import OTPVerification from "../components/OTPVerification";
import { useTheme } from "../_layout";
import geezSMSService from "../services/geezSMS";
import axios from "axios";
import { getApiBaseUrl } from "../services/apiUtils";
import SafeAreaContainer from "../utils/SafeAreaContainer";

const PhoneVerification = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+251");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [formattedPhone, setFormattedPhone] = useState("");

  const handlePhoneSubmit = async () => {
    if (phoneNumber.length >= 9) {
      setIsLoading(true);
      setError(null);
      
      // Format the phone number for consistency
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;
      const formattedNumber = geezSMSService.formatPhoneNumber(fullPhoneNumber);
      setFormattedPhone(formattedNumber);
      
      try {
        // Check if user exists first
        const checkResponse = await axios.post(`${getApiBaseUrl()}/auth/check-phone`, {
          phone: formattedNumber
        });
        
        console.log("User exists check response:", checkResponse.data);
        
        // Set whether the user exists or not
        if (checkResponse.data.success) {
          setUserExists(checkResponse.data.exists);
        }
        
        // Proceed to send OTP
        const response = await geezSMSService.sendOTP(formattedNumber);
        if (response.success) {
          setStep("otp");
        } else {
          setError(response.error || "Failed to send OTP");
        }
      } catch (err) {
        console.error("Error checking phone or sending OTP:", err);
        setError("Failed to process your request. Please try again.");
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
        console.log(`Attempting to verify OTP for phone ${formattedPhone} with code ${otpCode}`);
        
        // Pass name as undefined - name will be collected in profile setup
        const response = await geezSMSService.verifyOTP(
          formattedPhone,
          otpCode
        );
        
        console.log('OTP verification response:', JSON.stringify(response, null, 2));
        
        if (response.success) {
          console.log('Successfully verified OTP with token:', 
            response.data?.token ? response.data.token.substring(0, 20) + '...' : 'No token received');
          
          // Check if the user is new or existing
          const isNewUser = response.data?.isNewUser;
          const userRole = response.data?.user?.role;
          
          if (isNewUser || userExists === false) {
            // New user - redirect to profile setup
            console.log('New user signup - redirecting to profile setup');
            router.push("/auth/profile-setup");
          } else {
            // Existing user - redirect to appropriate dashboard
            if (userRole === 'CUSTOMER' || userRole === 'customer') {
              console.log('Existing customer - redirecting to customer dashboard');
              router.replace("/customer/dashboard");
            } else if (userRole === 'DRIVER' || userRole === 'driver') {
              console.log('Existing driver - redirecting to driver dashboard');
              router.replace("/driver/dashboard");
            } else {
              console.log(`Unknown role "${userRole}" - redirecting to profile setup`);
              router.replace("/auth/profile-setup");
            }
          }
        } else {
          console.log('OTP verification failed:', response.error || 'Verification failed');
          setError(response.error || "Invalid OTP code");
        }
      } catch (err) {
        console.error('OTP verification error:', err);
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
      const response = await geezSMSService.sendOTP(formattedPhone);
      if (!response.success) {
        setError(response.error || "Failed to resend OTP");
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
    <SafeAreaContainer extraPadding={{ top: 10 }}>
      <View className="flex-1">
        <TouchableOpacity onPress={handleBack} className="mb-6" style={{ pointerEvents: 'auto' }}>
          <ArrowLeft size={24} color={isDarkMode ? "#ffffff" : "#374151"} />
        </TouchableOpacity>

        <View className="mb-8">
          <Text className="text-3xl font-bold mb-2 text-neutral-800 dark:text-white">
            {step === "phone" 
              ? "Enter your phone" 
              : "Verify your number"}
          </Text>
          <Text className="text-neutral-600 dark:text-neutral-400">
            {step === "phone"
              ? "We'll send you a verification code"
              : `We've sent a verification code to ${formattedPhone}`}
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
            style={{ pointerEvents: 'auto' }}
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
          <Text className="text-neutral-600 dark:text-neutral-400 text-center mt-3 mb-2">
            Phone number is used for all authentication.
          </Text>
          <Text className="text-neutral-500 dark:text-neutral-400 text-sm">
            By continuing, you agree to our
          </Text>
          <View className="flex-row">
            <TouchableOpacity style={{ pointerEvents: 'auto' }}>
              <Text className="text-primary-500 text-sm">Terms of Service</Text>
            </TouchableOpacity>
            <Text className="text-neutral-500 dark:text-neutral-400 text-sm mx-1">
              and
            </Text>
            <TouchableOpacity style={{ pointerEvents: 'auto' }}>
              <Text className="text-primary-500 text-sm">Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaContainer>
  );
};

export default PhoneVerification;
