import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { CheckCircle, CreditCard, XCircle, AlertCircle } from 'lucide-react-native';
import PaymentOptions from './PaymentOptions';
import { initiateTelebirrPayment, simulatePaymentVerification } from '../services/telebirr';
import { getApiBaseUrl } from '../services/apiUtils';
import TelebirrWebView from './TelebirrWebView';

interface JobPaymentModalProps {
  isVisible: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  jobId: string;
  bidAmount: number;
  bidderName: string;
  pickupLocation: string;
  destinationLocation: string;
  isDarkMode: boolean;
}

const JobPaymentModal = ({
  isVisible,
  onClose,
  onPaymentSuccess,
  jobId,
  bidAmount,
  bidderName,
  pickupLocation,
  destinationLocation,
  isDarkMode
}: JobPaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState('telebirr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [telebirrPaymentUrl, setTelebirrPaymentUrl] = useState<string | null>(null);
  const [outTradeNo, setOutTradeNo] = useState<string>('');
  const [transactionId, setTransactionId] = useState('');

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    setPaymentError(null);
  };

  const generateOrderReference = () => {
    return `JOB-${jobId.substring(0, 8)}-${Date.now().toString().substring(9, 13)}`;
  };

  const handlePayment = async () => {
    if (paymentMethod === 'cash') {
      // Handle cash payment - in a real app, make an API call to mark job as cash payment
      onPaymentSuccess();
      onClose();
      return;
    }

    // Handle Telebirr payment
    setIsProcessing(true);
    setPaymentError(null);

    try {
      const referenceId = generateOrderReference();
      setTransactionId(referenceId);

      const response = await initiateTelebirrPayment({
        amount: bidAmount,
        referenceId,
        subject: `Job Payment - ${jobId.substring(0, 8)}`,
        customerName: 'Customer', // In a real app, get from user profile
        customerPhone: '0911111111', // In a real app, get from user profile
      });

      if (response.success && response.data?.toPayUrl) {
        // Set the payment URL and show the WebView
        setTelebirrPaymentUrl(response.data.toPayUrl);
        if (response.data.outTradeNo) {
          setOutTradeNo(response.data.outTradeNo);
        }
      } else {
        setPaymentError(response.message || 'Failed to initiate payment');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('An unexpected error occurred. Please try again.');
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (outTradeNo: string) => {
    // Verify the payment status
    try {
      // In a real app, call the backend to verify payment
      const verificationResult = await simulatePaymentVerification(outTradeNo);
      
      if (verificationResult.success) {
        setTelebirrPaymentUrl(null);
        setIsProcessing(false);
        onPaymentSuccess();
        onClose();
      } else {
        setPaymentError(verificationResult.message || 'Payment verification failed');
        setTelebirrPaymentUrl(null);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setPaymentError('Failed to verify payment. Please contact support.');
      setTelebirrPaymentUrl(null);
      setIsProcessing(false);
    }
  };

  const handlePaymentFailure = (message: string) => {
    setPaymentError(message);
    setTelebirrPaymentUrl(null);
    setIsProcessing(false);
  };

  return (
    <>
      {telebirrPaymentUrl && (
        <TelebirrWebView
          paymentUrl={telebirrPaymentUrl}
          outTradeNo={outTradeNo}
          onClose={() => {
            setTelebirrPaymentUrl(null);
            setIsProcessing(false);
          }}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentFailure={handlePaymentFailure}
        />
      )}
      
      <Modal
        visible={isVisible && !telebirrPaymentUrl}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.centeredView}>
          <View style={[
            styles.modalView, 
            isDarkMode ? styles.modalDark : styles.modalLight
          ]}>
            <Text style={[
              styles.title, 
              isDarkMode ? styles.textLight : styles.textDark
            ]}>
              Payment Required
            </Text>
            
            <Text style={[
              styles.subtitle, 
              isDarkMode ? styles.textLightSecondary : styles.textDarkSecondary
            ]}>
              Driver {bidderName} has accepted your job request
            </Text>

            <View style={[
              styles.jobInfoContainer, 
              isDarkMode ? styles.jobInfoDark : styles.jobInfoLight
            ]}>
              <View style={styles.jobInfoRow}>
                <Text style={isDarkMode ? styles.textLightSecondary : styles.textDarkSecondary}>
                  From:
                </Text>
                <Text style={[styles.jobInfoValue, isDarkMode ? styles.textLight : styles.textDark]}>
                  {pickupLocation}
                </Text>
              </View>
              
              <View style={styles.jobInfoRow}>
                <Text style={isDarkMode ? styles.textLightSecondary : styles.textDarkSecondary}>
                  To:
                </Text>
                <Text style={[styles.jobInfoValue, isDarkMode ? styles.textLight : styles.textDark]}>
                  {destinationLocation}
                </Text>
              </View>
              
              <View style={styles.jobInfoRow}>
                <Text style={isDarkMode ? styles.textLightSecondary : styles.textDarkSecondary}>
                  Bid Amount:
                </Text>
                <Text style={[styles.jobInfoValue, isDarkMode ? styles.textLight : styles.textDark]}>
                  {bidAmount.toFixed(2)} ETB
                </Text>
              </View>
            </View>
            
            <Text style={[
              styles.sectionTitle, 
              isDarkMode ? styles.textLight : styles.textDark
            ]}>
              Select Payment Method
            </Text>
            
            <PaymentOptions
              selectedMethod={paymentMethod}
              onSelectMethod={handlePaymentMethodChange}
              isProcessing={isProcessing}
              amount={bidAmount}
              paymentError={paymentError}
            />
            
            {paymentError && (
              <View style={styles.errorContainer}>
                <AlertCircle size={20} color="#ef4444" />
                <Text style={styles.errorText}>{paymentError}</Text>
              </View>
            )}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={isProcessing}
              >
                <XCircle size={20} color={isDarkMode ? "#e5e7eb" : "#374151"} />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.payButton, isProcessing && styles.disabledButton]}
                onPress={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <CreditCard size={20} color="#ffffff" />
                    <Text style={styles.payButtonText}>Pay Now</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalLight: {
    backgroundColor: 'white',
  },
  modalDark: {
    backgroundColor: '#262626',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  textDark: {
    color: '#1f2937',
  },
  textLight: {
    color: '#f9fafb',
  },
  textDarkSecondary: {
    color: '#4b5563',
  },
  textLightSecondary: {
    color: '#9ca3af',
  },
  jobInfoContainer: {
    width: '100%',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  jobInfoLight: {
    backgroundColor: '#f3f4f6',
  },
  jobInfoDark: {
    backgroundColor: '#1f2937',
  },
  jobInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  jobInfoValue: {
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
  },
  errorText: {
    color: '#b91c1c',
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '500',
    marginLeft: 8,
  },
  payButton: {
    backgroundColor: '#3b82f6',
    marginLeft: 8,
  },
  payButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default JobPaymentModal; 