import React, { useState, useRef, useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { ArrowLeft, Check, XCircle, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '../_layout';
import { getApiBaseUrl } from '../services/apiUtils';
import { verifyTelebirrPayment } from '../services/telebirr';

// Set to false in production to use the real Telebirr integration instead of mock
const MOCK_MODE = process.env.EXPO_PUBLIC_DEV_MODE === 'true';

interface TelebirrWebViewProps {
  paymentUrl: string;
  onClose: () => void;
  onPaymentSuccess: (outTradeNo: string) => void;
  onPaymentFailure: (message: string) => void;
  outTradeNo: string;
}

const TelebirrWebView = ({
  paymentUrl,
  onClose,
  onPaymentSuccess,
  onPaymentFailure,
  outTradeNo,
}: TelebirrWebViewProps) => {
  const { isDarkMode } = useTheme();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'warning'>('success');
  const [verificationStarted, setVerificationStarted] = useState(false);

  // Prepare success and error redirect URLs for detection in the WebView
  const successUrl = `${getApiBaseUrl()}/payments/telebirr/success`;
  const failureUrl = `${getApiBaseUrl()}/payments/telebirr/failure`;
  const cancelUrl = `${getApiBaseUrl()}/payments/telebirr/cancel`;

  // Verify payment status periodically if needed
  useEffect(() => {
    let verificationTimer: NodeJS.Timeout | null = null;
    
    if (paymentUrl && outTradeNo && !verificationStarted) {
      // Start verification after 10 seconds (giving user time to complete payment)
      verificationTimer = setTimeout(() => {
        setVerificationStarted(true);
        startPollingPaymentStatus();
      }, 10000);
    }
    
    return () => {
      if (verificationTimer) clearTimeout(verificationTimer);
    };
  }, [paymentUrl, outTradeNo, verificationStarted]);

  // Poll payment status function
  const startPollingPaymentStatus = () => {
    let attempts = 0;
    const maxAttempts = 10;
    const pollInterval = 5000; // 5 seconds between each check
    
    const checkPaymentStatus = async () => {
      if (attempts >= maxAttempts) {
        showStatus('warning', 'Payment verification timed out. Please check your Telebirr app.');
        return;
      }
      
      try {
        const result = await verifyTelebirrPayment(outTradeNo);
        
        if (result.success && result.data?.status === 'TRADE_SUCCESS') {
          showStatus('success', 'Payment successful!');
          setTimeout(() => {
            onPaymentSuccess(outTradeNo);
          }, 1500);
          return; // Stop polling once successful
        }
        
        // Continue polling if not successful
        attempts++;
        setTimeout(checkPaymentStatus, pollInterval);
      } catch (error) {
        console.error('Error verifying payment:', error);
        attempts++;
        setTimeout(checkPaymentStatus, pollInterval);
      }
    };
    
    // Start the polling process
    checkPaymentStatus();
  };

  useEffect(() => {
    // Log the URL for debugging
    console.log("Loading payment URL:", paymentUrl);
  }, [paymentUrl]);

  // JavaScript to inject into the WebView to detect payment completion
  const injectedJavaScript = `
    window.onerror = function(message, url, line, column, error) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'error',
        message: message,
        url: url,
        line: line,
        column: column
      }));
      return true;
    };
    
    // Listen for payment success/failure events within the page
    window.addEventListener('message', function(event) {
      if (event.data && typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);
          if (data.status === 'success' || data.status === 'failure' || data.status === 'cancel') {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'payment_status',
              status: data.status,
              message: data.message
            }));
          }
        } catch(e) {
          // Not a JSON message, ignore
        }
      }
    });
    true;
  `;

  // Handle WebView messages from the payment page
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'error') {
        console.error('WebView error:', data);
        return;
      }
      
      if (data.type === 'payment_status') {
        if (data.status === 'success') {
          showStatus('success', 'Payment successful!');
          setTimeout(() => {
            onPaymentSuccess(outTradeNo);
          }, 1500);
        } else if (data.status === 'failure') {
          showStatus('error', data.message || 'Payment failed. Please try again.');
          setTimeout(() => {
            onPaymentFailure(data.message || 'Payment failed');
          }, 1500);
        } else if (data.status === 'cancel') {
          showStatus('warning', 'Payment was cancelled');
          setTimeout(() => {
            onPaymentFailure('Payment was cancelled');
          }, 1500);
        }
      }
    } catch (error) {
      console.warn('Could not parse WebView message:', event.nativeEvent.data);
    }
  };

  // Handle WebView navigation state changes to detect redirects
  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    
    // Check if the URL matches our success, failure, or cancel URLs
    if (url.startsWith(successUrl)) {
      showStatus('success', 'Payment successful!');
      setTimeout(() => {
        onPaymentSuccess(outTradeNo);
      }, 1500);
    } else if (url.startsWith(failureUrl)) {
      const errorMsg = url.includes('message=') 
        ? decodeURIComponent(url.split('message=')[1].split('&')[0]) 
        : 'Payment failed. Please try again.';
      
      showStatus('error', errorMsg);
      setTimeout(() => {
        onPaymentFailure(errorMsg);
      }, 1500);
    } else if (url.startsWith(cancelUrl)) {
      showStatus('warning', 'Payment was cancelled');
      setTimeout(() => {
        onPaymentFailure('Payment was cancelled');
      }, 1500);
    }
  };

  // Show status modal with message
  const showStatus = (type: 'success' | 'error' | 'warning', message: string) => {
    setStatusType(type);
    setStatusMessage(message);
    setShowStatusModal(true);
  };

  // Mock payment simulator effect 
  useEffect(() => {
    if (MOCK_MODE) {
      setIsLoading(true);
      // Initialize mock payment flow
      const timer = setTimeout(() => {
        setIsLoading(false);
        showStatus('success', 'Payment successful! (Mock Mode)');
        setTimeout(() => {
          onPaymentSuccess(outTradeNo);
        }, 2000);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [MOCK_MODE, outTradeNo, onPaymentSuccess]);

  // Render mock payment UI if in mock mode
  if (MOCK_MODE) {
    return (
      <SafeAreaView style={[
        styles.container, 
        { backgroundColor: isDarkMode ? '#171717' : '#ffffff' }
      ]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <ArrowLeft size={24} color={isDarkMode ? '#ffffff' : '#374151'} />
          </TouchableOpacity>
          <Text style={[
            styles.headerTitle, 
            { color: isDarkMode ? '#ffffff' : '#1f2937' }
          ]}>
            Telebirr Payment (Mock)
          </Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.mockContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1976D2" />
              <Text style={styles.loadingText}>Loading Telebirr Payment...</Text>
            </View>
          ) : (
            <View style={styles.mockPaymentContent}>
              <Text style={styles.mockTitle}>Telebirr Payment Demo</Text>
              <Text style={styles.mockSubtitle}>This is a simulated payment for testing</Text>
              
              <View style={styles.mockProgressContainer}>
                <View style={[styles.mockProgressBar, { width: '100%' }]} />
              </View>
              <Text style={styles.mockProgressText}>100% Complete</Text>
              
              <View style={styles.mockPaymentActions}>
                <TouchableOpacity 
                  style={[styles.mockButton, styles.mockButtonSuccess]} 
                  onPress={() => {
                    showStatus('success', 'Payment successful! (Mock Mode)');
                    setTimeout(() => {
                      onPaymentSuccess(outTradeNo);
                    }, 2000);
                  }}
                >
                  <Text style={styles.mockButtonText}>Complete Payment</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.mockButton, styles.mockButtonCancel]}
                  onPress={() => {
                    showStatus('warning', 'Payment cancelled. (Mock Mode)');
                    setTimeout(() => {
                      onPaymentFailure('Payment cancelled by user');
                    }, 2000);
                  }}
                >
                  <Text style={styles.mockButtonText}>Cancel Payment</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.mockButton, styles.mockButtonFailure]}
                  onPress={() => {
                    showStatus('error', 'Payment failed. (Mock Mode)');
                    setTimeout(() => {
                      onPaymentFailure('Payment failed');
                    }, 2000);
                  }}
                >
                  <Text style={styles.mockButtonText}>Simulate Error</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Real mode - actual WebView
  return (
    <SafeAreaView style={[
      styles.container, 
      { backgroundColor: isDarkMode ? '#171717' : '#ffffff' }
    ]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <ArrowLeft size={24} color={isDarkMode ? '#ffffff' : '#374151'} />
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle, 
          { color: isDarkMode ? '#ffffff' : '#1f2937' }
        ]}>
          Telebirr Payment
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <XCircle size={48} color="#ef4444" />
          <Text style={styles.errorText}>
            {error || 'An error occurred while loading the payment page.'}
          </Text>
          <TouchableOpacity
            style={styles.reloadButton}
            onPress={() => {
              setError(null);
              setIsLoading(true);
              webViewRef.current?.reload();
            }}
          >
            <Text style={styles.reloadButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#1976D2" />
              <Text style={styles.loadingText}>Loading Telebirr Payment...</Text>
            </View>
          )}
          
          <WebView
            ref={webViewRef}
            source={{ uri: paymentUrl }}
            style={styles.webview}
            onMessage={handleMessage}
            onNavigationStateChange={handleNavigationStateChange}
            injectedJavaScript={injectedJavaScript}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              setError(nativeEvent.description || 'Failed to load payment page');
              setIsLoading(false);
            }}
            startInLoadingState={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </>
      )}
      
      {/* Status modal - used for both real and mock modes */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: isDarkMode ? '#262626' : '#ffffff' }
          ]}>
            {statusType === 'success' && <Check size={48} color="#10b981" />}
            {statusType === 'error' && <XCircle size={48} color="#ef4444" />}
            {statusType === 'warning' && <AlertTriangle size={48} color="#f59e0b" />}
            
            <Text style={[
              styles.modalText,
              { color: isDarkMode ? '#ffffff' : '#1f2937' }
            ]}>
              {statusMessage}
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginVertical: 16,
  },
  reloadButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  reloadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  modalText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    color: '#1f2937',
  },
  mockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mockPaymentContent: {
    width: '100%',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  mockTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  mockSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  mockProgressContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  mockProgressBar: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  mockProgressText: {
    fontSize: 14,
    color: '#10b981',
    marginBottom: 32,
  },
  mockPaymentActions: {
    width: '100%',
  },
  mockButton: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  mockButtonSuccess: {
    backgroundColor: '#10b981',
  },
  mockButtonCancel: {
    backgroundColor: '#6b7280',
  },
  mockButtonFailure: {
    backgroundColor: '#ef4444',
  },
  mockButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default TelebirrWebView; 