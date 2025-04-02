import { Platform } from "react-native";
import * as SMS from "expo-sms";
import * as Linking from "expo-linking";

interface MessageOptions {
  phoneNumber: string;
  message: string;
}

const messagingService = {
  async sendSMS({ phoneNumber, message }: MessageOptions) {
    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        await SMS.sendSMSAsync([phoneNumber], message);
        return { success: true };
      }
      return { success: false, error: "SMS is not available on this device" };
    } catch (error) {
      return { success: false, error };
    }
  },

  async makePhoneCall(phoneNumber: string) {
    try {
      const url = Platform.select({
        ios: `telprompt:${phoneNumber}`,
        android: `tel:${phoneNumber}`,
      });
      
      if (url) {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
          return { success: true };
        }
      }
      return { success: false, error: "Phone calls are not supported on this device" };
    } catch (error) {
      return { success: false, error };
    }
  },

  async sendWhatsAppMessage({ phoneNumber, message }: MessageOptions) {
    try {
      const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return { success: true };
      }
      return { success: false, error: "WhatsApp is not installed" };
    } catch (error) {
      return { success: false, error };
    }
  },
};

export default messagingService; 