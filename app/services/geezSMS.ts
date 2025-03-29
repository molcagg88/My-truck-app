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

const GEEZSMS_API_KEY = process.env.EXPO_PUBLIC_GEEZSMS_API_KEY;
const GEEZSMS_API_URL = "https://api.geezsms.com/v1";

export const sendOTP = async (params: SendOTPParams): Promise<OTPResponse> => {
  try {
    if (!GEEZSMS_API_KEY) {
      throw new Error("GeezSMS API key is not configured");
    }

    const response = await fetch(`${GEEZSMS_API_URL}/otp/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GEEZSMS_API_KEY}`,
      },
      body: JSON.stringify({
        phone_number: params.phoneNumber,
        template: params.messageTemplate || "Your verification code is: {code}",
        length: 6,
        expiry: 300, // 5 minutes
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send OTP");
    }

    return {
      success: true,
      message: "OTP sent successfully",
      data: {
        otpId: data.otp_id,
        expiresIn: data.expiry,
      },
    };
  } catch (error) {
    console.error("GeezSMS OTP error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send OTP. Please try again.",
    };
  }
};

export const verifyOTP = async (
  params: VerifyOTPParams,
): Promise<VerificationResponse> => {
  try {
    if (!GEEZSMS_API_KEY) {
      throw new Error("GeezSMS API key is not configured");
    }

    const response = await fetch(`${GEEZSMS_API_URL}/otp/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GEEZSMS_API_KEY}`,
      },
      body: JSON.stringify({
        phone_number: params.phoneNumber,
        code: params.otpCode,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to verify OTP");
    }

    return {
      success: true,
      message: "OTP verified successfully",
      data: {
        isValid: data.is_valid,
        userId: data.user_id,
      },
    };
  } catch (error) {
    console.error("GeezSMS verification error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to verify OTP. Please try again.",
    };
  }
};
