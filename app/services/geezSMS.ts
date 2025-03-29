// GeezSMS OTP verification service integration

interface SendOTPParams {
  phoneNumber: string;
  messageTemplate?: string;
}

interface OTPResponse {
  success: boolean;
  message: string;
  data?: {
    otpId?: string;
    expiresIn?: number;
  };
}

interface VerifyOTPParams {
  phoneNumber: string;
  otpCode: string;
}

interface VerificationResponse {
  success: boolean;
  message: string;
  data?: {
    isValid?: boolean;
    userId?: string;
  };
}

// Mock implementation - replace with actual GeezSMS API integration
export const sendOTP = async (params: SendOTPParams): Promise<OTPResponse> => {
  try {
    // In a real implementation, this would make an API call to GeezSMS
    // For demo purposes, we're simulating a successful response

    console.log("Sending OTP to:", params.phoneNumber);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock successful response
    return {
      success: true,
      message: "OTP sent successfully",
      data: {
        otpId: `OTP-${Date.now()}`,
        expiresIn: 300, // 5 minutes
      },
    };
  } catch (error) {
    console.error("GeezSMS OTP error:", error);
    return {
      success: false,
      message: "Failed to send OTP. Please try again.",
    };
  }
};

export const verifyOTP = async (
  params: VerifyOTPParams,
): Promise<VerificationResponse> => {
  try {
    // In a real implementation, this would verify the OTP with GeezSMS
    // For demo purposes, we're simulating a successful verification

    console.log("Verifying OTP:", params);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // For demo purposes, accept any 6-digit code
    // In production, this would validate against the actual OTP
    const isValidFormat = /^\d{6}$/.test(params.otpCode);

    if (isValidFormat) {
      return {
        success: true,
        message: "OTP verified successfully",
        data: {
          isValid: true,
          userId: `USER-${Date.now()}`,
        },
      };
    } else {
      return {
        success: false,
        message: "Invalid OTP format. Please enter a 6-digit code.",
        data: {
          isValid: false,
        },
      };
    }
  } catch (error) {
    console.error("GeezSMS verification error:", error);
    return {
      success: false,
      message: "Failed to verify OTP. Please try again.",
    };
  }
};
