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
const DEV_MODE = process.env.EXPO_PUBLIC_DEV_MODE === "true";
const DEV_OTP = "123456";

const geezSMSService = {
  async sendOTP(phoneNumber: string) {
    if (DEV_MODE) {
      console.log("Development mode: OTP would be sent to", phoneNumber);
      return {
        success: true,
        data: {
          otpId: "dev-otp-id",
          expiryTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        },
      };
    }

    try {
      const response = await fetch("https://api.geezsms.com/v1/otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GEEZSMS_API_KEY}`,
        },
        body: JSON.stringify({
          phoneNumber,
          message: "Your OTP code is: {otp}",
          expiryTime: 5, // 5 minutes
        }),
      });

      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : null,
        error: !response.ok ? data.message : null,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to send OTP. Please try again.",
      };
    }
  },

  async verifyOTP(otpId: string, otp: string) {
    if (DEV_MODE) {
      if (otp === DEV_OTP) {
        return {
          success: true,
          data: {
            message: "OTP verified successfully",
            userId: "dev-user-id",
          },
        };
      }
      return {
        success: false,
        error: "Invalid OTP code",
      };
    }

    try {
      const response = await fetch("https://api.geezsms.com/v1/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GEEZSMS_API_KEY}`,
        },
        body: JSON.stringify({
          otpId,
          otp,
        }),
      });

      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : null,
        error: !response.ok ? data.message : null,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to verify OTP. Please try again.",
      };
    }
  },
};

export default geezSMSService;
