/**
 * Configuration file for Telebirr payments integration
 */
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Default test Telebirr keys for development and testing only
// In production, these should come from environment variables and be kept secure
const DEFAULT_TEST_APP_ID = 'TEST_APP_ID_12345';
const DEFAULT_TEST_APP_KEY = 'test123456key789012';

// Key used for local mock encryption
const DEFAULT_TEST_PUBLIC_KEY = `
-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCiJ/2uyJK5gX0BDYMdH/vn2QcC
ZQpZN89WtLlvwpbRwZpFZ5YspKhwYgHHuRRgBXfy+dQQQ8UC0DFmqKVSbPR/Pjqc
tDXyKFBLD2C+AgQUbt6wP5RiRITlNIxh0ZH8bvEr2PtLYelvdaWIAEy9EYU9zleB
bNZvf2JiVJ4W3yy+twIDAQAB
-----END PUBLIC KEY-----
`;

// Configure Telebirr settings
export const telebirrConfig = {
  // App ID provided by Telebirr
  appId: process.env.TELEBIRR_APP_ID || DEFAULT_TEST_APP_ID,
  
  // App Key provided by Telebirr (keep this secret)
  appKey: process.env.TELEBIRR_APP_KEY || DEFAULT_TEST_APP_KEY,
  
  // Public key provided by Telebirr for encryption
  publicKey: process.env.TELEBIRR_PUBLIC_KEY || DEFAULT_TEST_PUBLIC_KEY,
  
  // Notification URL for callbacks from Telebirr (must be publicly accessible)
  notifyUrl: process.env.TELEBIRR_NOTIFY_URL || 'https://your-api-domain.com/api/payments/telebirr/callback',
  
  // Return URL for redirecting users after payment
  returnUrl: process.env.TELEBIRR_RETURN_URL || 'https://your-app-domain.com/payment/result',
  
  // Telebirr API endpoint - use production URL for live payments, test URL for testing
  apiUrl: process.env.TELEBIRR_API_URL || 'https://api-test.telebirr.com/api/checkout/payment',
  
  // Short code for merchant account
  shortCode: process.env.TELEBIRR_SHORT_CODE || '110010',
  
  // Default timeout for payments in minutes
  timeoutExpress: process.env.TELEBIRR_TIMEOUT || '30',
  
  // Whether to use mock encryption (for development/testing)
  useMockEncryption: process.env.NODE_ENV !== 'production'
};

export default telebirrConfig; 