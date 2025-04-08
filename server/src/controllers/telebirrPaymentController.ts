import crypto from 'crypto';
import axios from 'axios';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../config/database';
import { telebirrConfig } from '../config/telebirrConfig';
import { Payment } from '../entities/Payment';
import { handleErrorResponse } from '../utils/errorHandler';

// Get Payment repository
const getPaymentRepository = () => AppDataSource.getRepository(Payment);

// Configuration constants from config file
const TELEBIRR_APP_ID = telebirrConfig.appId;
const TELEBIRR_APP_KEY = telebirrConfig.appKey;
const PUBLIC_KEY = telebirrConfig.publicKey;
const NOTIFY_URL = telebirrConfig.notifyUrl;
const RETURN_URL = telebirrConfig.returnUrl;
const API_URL = telebirrConfig.apiUrl;
const SHORT_CODE = telebirrConfig.shortCode;
const TIMEOUT_EXPRESS = telebirrConfig.timeoutExpress;
const USE_MOCK_ENCRYPTION = telebirrConfig.useMockEncryption;

interface TelebirrRequestData {
  appId: string;
  timestamp: string;
  nonce: string;
  outTradeNo: string;
  notifyUrl?: string;
  returnUrl?: string;
  subject?: string;
  totalAmount?: string;
  shortCode?: string;
  receiveName?: string;
  timeoutExpress?: string;
  [key: string]: string | undefined;
}

interface TelebirrCallbackData {
  outTradeNo: string;
  tradeNo: string;
  tradeStatus: string;
  totalAmount: string;
  signature?: string;
  [key: string]: any;
}

// Create a new payment
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { amount, subject, outTradeNo, receiveName } = req.body;

    // Log the payment request
    console.log(`Creating payment [MOCK MODE]: amount=${amount}, subject=${subject}, outTradeNo=${outTradeNo}`);

    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    // Generate a unique trade number if not provided
    const finalTradeNo = outTradeNo || `TRUCK_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    console.log('MOCK MODE: Skipping Telebirr API call and returning mock payment URL');
    
    // Generate mock payment details
    const mockTradeNo = `MOCK_${Date.now()}`;
    const mockPaymentUrl = `https://mock-telebirr.example.com/pay/${mockTradeNo}`;
    
    // Save payment details to database (still do this part to maintain app flow)
    try {
      const paymentRepository = getPaymentRepository();
      await paymentRepository.save({
        outTradeNo: finalTradeNo,
        amount: parseFloat(amount),
        subject: subject || 'Truck Booking',
        status: 'pending',
        paymentMethod: 'telebirr',
        customerName: receiveName || 'Customer',
        paymentUrl: mockPaymentUrl,
        tradeNo: mockTradeNo,
        createdAt: new Date()
      });
    } catch (dbError) {
      console.error('Failed to save mock payment to database:', dbError);
      // Continue even if saving to DB fails, so user can still test the flow
    }

    // Return success response with mock payment URL
    return res.status(200).json({
      success: true,
      message: 'Mock payment initiated successfully',
      data: {
        paymentUrl: mockPaymentUrl,
        outTradeNo: finalTradeNo
      }
    });
  } catch (error) {
    console.error('Mock payment creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate mock payment',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Verify payment status - mocked implementation
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { outTradeNo } = req.params;
    
    if (!outTradeNo) {
      return res.status(400).json({
        success: false, 
        message: 'Missing outTradeNo parameter'
      });
    }
    
    // Check if payment exists in database
    const paymentRepository = getPaymentRepository();
    const payment = await paymentRepository.findOne({ where: { outTradeNo } });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    console.log('MOCK MODE: Returning successful payment verification');
    
    // Always update to completed for mock implementation
    payment.status = 'completed';
    await paymentRepository.save(payment);
    
    return res.status(200).json({
      success: true,
      message: 'Mock payment completed successfully',
      data: {
        status: 'completed',
        amount: payment.amount,
        tradeNo: payment.tradeNo,
        outTradeNo: payment.outTradeNo,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Mock payment verification error:', error);
    return handleErrorResponse(res, error, 'Failed to verify mock payment');
  }
};

// Handle payment callback from Telebirr - mocked implementation
export const handleCallback = async (req: Request, res: Response) => {
  try {
    const { outTradeNo } = req.body;
    
    console.log('MOCK MODE: Processing mock callback for', outTradeNo);
    
    // Find the payment in database
    const paymentRepository = getPaymentRepository();
    const payment = await paymentRepository.findOne({ where: { outTradeNo } });
    
    if (!payment) {
      console.error('Payment not found:', outTradeNo);
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Always update to completed for mock implementation
    payment.status = 'completed';
    await paymentRepository.save(payment);
    
    return res.status(200).json({ message: 'Mock callback processed successfully' });
  } catch (error) {
    console.error('Mock callback processing error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Success page - shown after successful payment
export const successPage = (req: Request, res: Response) => {
  const { outTradeNo } = req.params;
  
  // Return an HTML page that communicates with the WebView
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Successful</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
        }
        .success-container {
          background-color: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          max-width: 90%;
          width: 360px;
        }
        .success-icon {
          width: 64px;
          height: 64px;
          margin-bottom: 24px;
          color: #10B981;
        }
        h1 {
          font-size: 24px;
          color: #111827;
          margin: 0 0 12px 0;
        }
        p {
          font-size: 16px;
          color: #6B7280;
          margin: 0 0 24px 0;
        }
        .button {
          background-color: #10B981;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .button:hover {
          background-color: #059669;
        }
      </style>
    </head>
    <body>
      <div class="success-container">
        <svg class="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h1>Payment Successful!</h1>
        <p>Your payment has been processed successfully. You will be redirected back to the app.</p>
        <button class="button" id="continueButton">Continue</button>
      </div>
      
      <script>
        document.getElementById('continueButton').addEventListener('click', function() {
          // Send message to WebView
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'PAYMENT_SUCCESS',
            data: { outTradeNo: '${outTradeNo}' }
          }));
        });
        
        // Auto send message after 3 seconds
        setTimeout(function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'PAYMENT_SUCCESS',
            data: { outTradeNo: '${outTradeNo}' }
          }));
        }, 3000);
      </script>
    </body>
    </html>
  `);
};

// Failure page - shown after failed payment
export const failurePage = (req: Request, res: Response) => {
  const { outTradeNo, message } = req.params;
  const errorMessage = message || 'Payment could not be processed. Please try again.';
  
  // Return an HTML page that communicates with the WebView
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Failed</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
        }
        .error-container {
          background-color: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          max-width: 90%;
          width: 360px;
        }
        .error-icon {
          width: 64px;
          height: 64px;
          margin-bottom: 24px;
          color: #EF4444;
        }
        h1 {
          font-size: 24px;
          color: #111827;
          margin: 0 0 12px 0;
        }
        p {
          font-size: 16px;
          color: #6B7280;
          margin: 0 0 24px 0;
        }
        .button {
          background-color: #6B7280;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .button:hover {
          background-color: #4B5563;
        }
      </style>
    </head>
    <body>
      <div class="error-container">
        <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h1>Payment Failed</h1>
        <p>${errorMessage}</p>
        <button class="button" id="tryAgainButton">Try Again</button>
      </div>
      
      <script>
        document.getElementById('tryAgainButton').addEventListener('click', function() {
          // Send message to WebView
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'PAYMENT_FAILURE',
            data: { 
              outTradeNo: '${outTradeNo}',
              message: '${errorMessage}'
            }
          }));
        });
        
        // Auto send message after 3 seconds
        setTimeout(function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'PAYMENT_FAILURE',
            data: { 
              outTradeNo: '${outTradeNo}',
              message: '${errorMessage}'
            }
          }));
        }, 3000);
      </script>
    </body>
    </html>
  `);
};

// Cancel page - shown when user cancels the payment
export const cancelPage = (req: Request, res: Response) => {
  const { outTradeNo } = req.params;
  
  // Return an HTML page that communicates with the WebView
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Cancelled</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
        }
        .cancel-container {
          background-color: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          max-width: 90%;
          width: 360px;
        }
        .cancel-icon {
          width: 64px;
          height: 64px;
          margin-bottom: 24px;
          color: #F59E0B;
        }
        h1 {
          font-size: 24px;
          color: #111827;
          margin: 0 0 12px 0;
        }
        p {
          font-size: 16px;
          color: #6B7280;
          margin: 0 0 24px 0;
        }
        .button {
          background-color: #6B7280;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .button:hover {
          background-color: #4B5563;
        }
      </style>
    </head>
    <body>
      <div class="cancel-container">
        <svg class="cancel-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h1>Payment Cancelled</h1>
        <p>You've cancelled the payment process. You can try again or choose another payment method.</p>
        <button class="button" id="goBackButton">Go Back</button>
      </div>
      
      <script>
        document.getElementById('goBackButton').addEventListener('click', function() {
          // Send message to WebView
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'PAYMENT_CANCELLED',
            data: { outTradeNo: '${outTradeNo}' }
          }));
        });
        
        // Auto send message after 3 seconds
        setTimeout(function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'PAYMENT_CANCELLED',
            data: { outTradeNo: '${outTradeNo}' }
          }));
        }, 3000);
      </script>
    </body>
    </html>
  `);
};

// Helper Functions

// Encrypt request data using Telebirr's public key
async function encryptRequestData(data: TelebirrRequestData) {
  try {
    // Convert the request data to a JSON string
    const jsonData = JSON.stringify(data);
    
    // Log for debugging
    console.log("Encrypting data:", { 
      dataKeys: Object.keys(data),
      publicKeyProvided: !!PUBLIC_KEY, 
      publicKeyLength: PUBLIC_KEY?.length,
      useMockEncryption: USE_MOCK_ENCRYPTION
    });

    // For testing/development, use mock encryption
    if (USE_MOCK_ENCRYPTION) {
      console.log("Using mock encryption for development");
      // Create a mock encryption result
      const mockEncrypted = Buffer.from(jsonData).toString('base64');
      const mockSign = calculateSignature(data);
      
      return {
        ussd: mockEncrypted,
        sign: mockSign,
      };
    }
    
    // Real encryption for production
    // The public key should already be in PEM format from the config
    try {
      const buffer = Buffer.from(jsonData);
      const encrypted = crypto.publicEncrypt(
        {
          key: PUBLIC_KEY,
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        buffer
      );
      
      // Convert the encrypted data to base64
      const encryptedBase64 = encrypted.toString('base64');
      
      // Generate the signature
      const sign = calculateSignature(data);
      
      return {
        ussd: encryptedBase64,
        sign,
      };
    } catch (encryptError) {
      console.error('RSA encryption failed:', encryptError);
      
      // If production encryption fails, throw error instead of fallback
      if (!USE_MOCK_ENCRYPTION) {
        throw encryptError;
      }
      
      // Fallback to mock encryption even in production if RSA fails
      console.warn("Falling back to mock encryption due to RSA failure");
      const mockEncrypted = Buffer.from(jsonData).toString('base64');
      const mockSign = calculateSignature(data);
      
      return {
        ussd: mockEncrypted,
        sign: mockSign,
      };
    }
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt request data');
  }
}

// Decrypt response data using Telebirr's algorithm
function decryptResponseData(encryptedData: string): any {
  try {
    // In development, we can just try to decode base64 directly
    if (USE_MOCK_ENCRYPTION) {
      try {
        // Try to decode as base64 first (for mock encryption)
        const jsonString = Buffer.from(encryptedData, 'base64').toString('utf8');
        return JSON.parse(jsonString);
      } catch (mockError) {
        console.warn('Mock decryption failed, trying real decryption:', mockError);
        // Fall through to real decryption if this fails
      }
    }
    
    // Real decryption for production
    // Decode the base64 string
    const buffer = Buffer.from(encryptedData, 'base64');
    
    // Decrypt the data using AES with the app key
    const decipher = crypto.createDecipheriv(
      'aes-128-ecb',
      Buffer.from(TELEBIRR_APP_KEY),
      Buffer.alloc(0) // No IV for ECB mode
    );
    
    // Update the decipher with the encrypted data
    let decrypted = decipher.update(buffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    // Parse the decrypted JSON
    return JSON.parse(decrypted.toString('utf8'));
  } catch (error) {
    console.error('Decryption error:', error);
    
    // For development, return a mock success response if decryption fails
    if (USE_MOCK_ENCRYPTION) {
      console.warn('Returning mock response due to decryption failure');
      return {
        toPayUrl: `https://telebirr-mock-pay.com/pay/${Date.now()}`,
        tradeNo: `MOCK_${Date.now()}`,
        tradeStatus: 'SUCCESS'
      };
    }
    
    throw new Error('Failed to decrypt response data');
  }
}

// Calculate signature for request data
function calculateSignature(data: Record<string, string | undefined>): string {
  try {
    // Sort the data keys alphabetically and filter out undefined values
    const sortedKeys = Object.keys(data).sort();
    
    // Build a string of key=value pairs (skipping undefined values)
    let signString = '';
    for (const key of sortedKeys) {
      const value = data[key];
      if (value !== undefined) {
        signString += `${key}=${value}&`;
      }
    }
    
    // Append the app key
    signString += `key=${TELEBIRR_APP_KEY}`;
    
    // Calculate the MD5 hash
    const md5Hash = crypto.createHash('md5').update(signString).digest('hex');
    
    return md5Hash.toUpperCase();
  } catch (error) {
    console.error('Signature calculation error:', error);
    throw new Error('Failed to calculate signature');
  }
}

// Verify callback signature from Telebirr
function verifyCallbackSignature(callbackData: TelebirrCallbackData, signature: string): boolean {
  try {
    // Extract signature fields
    const { signature: providedSignature, ...dataToVerify } = callbackData;
    
    // Calculate expected signature
    const expectedSignature = calculateSignature(dataToVerify as Record<string, string | undefined>);
    
    // Compare signatures
    return expectedSignature === signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
} 