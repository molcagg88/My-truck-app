import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotifications = async () => {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  }

  return null;
};

export const sendBidNotification = async (
  customerId: string,
  jobId: string,
  bidAmount: number
) => {
  try {
    // In a real app, this would:
    // 1. Get the customer's push token from your backend
    // 2. Send the notification through your push notification service
    // 3. Update the notification status in your database

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "New Bid Received",
        body: `A driver has placed a bid of ${bidAmount.toLocaleString()} ETB on your job request.`,
        data: { jobId },
      },
      trigger: null,
    });

    return true;
  } catch (error) {
    console.error("Failed to send bid notification:", error);
    return false;
  }
};

export const sendCounterBidNotification = async (
  driverId: string,
  jobId: string,
  counterBidAmount: number
) => {
  try {
    // In a real app, this would:
    // 1. Get the driver's push token from your backend
    // 2. Send the notification through your push notification service
    // 3. Update the notification status in your database

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Counter Bid Received",
        body: `The customer has placed a counter bid of ${counterBidAmount.toLocaleString()} ETB.`,
        data: { jobId },
      },
      trigger: null,
    });

    return true;
  } catch (error) {
    console.error("Failed to send counter bid notification:", error);
    return false;
  }
};

export const sendBidAcceptedNotification = async (
  driverId: string,
  jobId: string,
  finalPrice: number
) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Bid Accepted",
        body: `Your bid of ${finalPrice.toLocaleString()} ETB has been accepted!`,
        data: { jobId },
      },
      trigger: null,
    });

    return true;
  } catch (error) {
    console.error("Failed to send bid accepted notification:", error);
    return false;
  }
};

export const sendBidDeclinedNotification = async (
  driverId: string,
  jobId: string
) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Bid Declined",
        body: "Your bid has been declined by the customer.",
        data: { jobId },
      },
      trigger: null,
    });

    return true;
  } catch (error) {
    console.error("Failed to send bid declined notification:", error);
    return false;
  }
};

const notifications = {
  registerForPushNotifications,
  sendBidNotification,
  sendCounterBidNotification,
  sendBidAcceptedNotification,
  sendBidDeclinedNotification,
};

export default notifications; 