// Telebirr payment service integration

import { getApiBaseUrl } from "./apiUtils";

interface TelebirrPaymentParams {
  amount: number;
  referenceId: string;
  subject?: string;
  customerName?: string;
  customerPhone?: string;
}

interface TelebirrResponse {
  success: boolean;
  message: string;
  data?: {
    outTradeNo?: string;
    toPayUrl?: string;
  };
}

interface PaymentRequest {
  amount: number;
  referenceId: string;
  subject: string;
  customerName: string;
  customerPhone: string;
}

interface PaymentResponse {
  success: boolean;
  data?: {
    toPayUrl?: string;
    outTradeNo?: string;
  };
  message?: string;
}

interface VerificationResponse {
  success: boolean;
  data?: {
    status: string;
    outTradeNo: string;
    totalAmount: string;
  };
  message?: string;
}

// Function to create a payment via the backend
export const initiateTelebirrPayment = async (
  paymentData: PaymentRequest
): Promise<PaymentResponse> => {
  try {
    // Create an AbortController to implement timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    // Call the backend API to initiate payment and get the secure URL
    const response = await fetch(`${getApiBaseUrl()}/payments/telebirr/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
      signal: controller.signal
    });

    // Clear the timeout
    clearTimeout(timeoutId);

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to initiate payment",
      };
    }

    // Handle the expected response format from our controller
    return {
      success: true,
      data: {
        toPayUrl: data.data?.toPayUrl,
        outTradeNo: data.data?.outTradeNo,
      },
    };
  } catch (error: any) {
    console.error("Error initiating payment:", error);
    
    // Handle timeout specifically
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: "Payment request timed out. Please try again.",
      };
    }
    
    return {
      success: false,
      message: "Network error while initiating payment",
    };
  }
};

// Function to verify payment status
export const verifyTelebirrPayment = async (
  outTradeNo: string
): Promise<VerificationResponse> => {
  try {
    // Call the backend API to verify the payment status
    const response = await fetch(`${getApiBaseUrl()}/payments/telebirr/verify/${outTradeNo}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to verify payment",
      };
    }

    return {
      success: true,
      data: {
        status: data.data?.status,
        outTradeNo: data.data?.outTradeNo,
        totalAmount: data.data?.amount,
      },
    };
  } catch (error) {
    console.error("Error verifying payment:", error);
    return {
      success: false,
      message: "Network error while verifying payment",
    };
  }
};

// Mock implementation for demo purposes
// In a real app, this would be handled by the backend
export const simulatePaymentVerification = async (
  outTradeNo: string
): Promise<VerificationResponse> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  // Simulate a successful payment (90% chance of success)
  const isSuccess = Math.random() < 0.9;
  
  if (isSuccess) {
    return {
      success: true,
      data: {
        status: "TRADE_SUCCESS",
        outTradeNo,
        totalAmount: "500.00",
      },
    };
  } else {
    return {
      success: false,
      message: "Payment verification failed or payment was cancelled",
    };
  }
};

const telebirr = {
  initiateTelebirrPayment,
  verifyTelebirrPayment,
  simulatePaymentVerification
};

export default telebirr;
