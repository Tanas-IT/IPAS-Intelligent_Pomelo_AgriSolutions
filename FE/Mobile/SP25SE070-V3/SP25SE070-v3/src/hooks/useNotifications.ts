import { useEffect, useState, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Config from "react-native-config";
import Toast from "react-native-toast-message";
import { ROUTE_NAMES } from "@/constants/RouteNames";
import { CommonActions } from "@react-navigation/native";
import { GetNotification } from "@/types/notification";
import { NotificationService } from "@/services";
import { useAuthStore } from "@/store";

const WS_URL = process.env.EXPO_PUBLIC_PUBLIC_WS_URL;
console.log("WS_URL", WS_URL);


const useNotifications = () => {
  const [notifications, setNotifications] = useState<GetNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const navigation = useNavigation();
  const { userId } = useAuthStore();

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      Toast.show({ type: "error", text1: "userId not found" });
      return;
    }

    try {
      console.log("ảo z", userId);
      
      const response = await NotificationService.getNotificationByUser(Number(userId));
      console.log("noti", response);
      
      if (response.statusCode === 200) {
        setNotifications(response.data);
      }
    } catch (error: any) {
      console.error("Fetch error:", error);
      Toast.show({
        type: "error",
        text1: "error fethcing notifications",
        text2: "Please try again later",
      });
      if (error.response?.status === 401) {
        await AsyncStorage.clear();
        return { error: "Unauthorized" }; // Trả về lỗi để component xử lý
      }
      // if (error.response?.status === 401) {
      //   await AsyncStorage.clear();
      //   navigation.dispatch(
      //     CommonActions.reset({
      //       index: 0,
      //       routes: [{ name: ROUTE_NAMES.AUTH.LOGIN }],
      //     })
      //   );
      // }
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.isRead).length);
  }, [notifications]);

  useEffect(() => {
    const setupWebSocket = async () => {
      if (!userId) return;

      const ws = new WebSocket(`${WS_URL}?userId=${userId}`);

      ws.onopen = () => {
        console.log("Connected to WebSocket!");
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("Parsed Message:", message);
          fetchNotifications();
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };

      ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      setSocket(ws);

      return () => {
        ws.close();
      };
    };

    setupWebSocket();
  }, []);

  const markAsRead = useCallback(async (notificationId: number) => {
    if (!userId) return;

    setNotifications((prev) =>
      prev.map((n) =>
        n.notificationId === notificationId ? { ...n, isRead: true } : n
      )
    );

    try {
      const response = await NotificationService.markAsRead(
        Number(userId),
        "once",
        notificationId
      );
      if (response.statusCode !== 200)
        throw new Error("Failed to mark as read");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Failed to mark as read",
      });
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notificationId ? { ...n, isRead: false } : n
        )
      );
      if (error.response?.status === 401) {
        await AsyncStorage.clear();
        return { error: "Unauthorized" }; // Trả về lỗi để component xử lý
      }
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      const response = await NotificationService.markAsRead(Number(userId));
      if (response.statusCode !== 200)
        throw new Error("Failed to mark all as read");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Failed to mark all as read",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: false })));
      if (error.response?.status === 401) {
        await AsyncStorage.clear();
        return { error: "Unauthorized" }; // Trả về lỗi để component xử lý
      }
    }
  }, []);

  return { notifications, unreadCount, markAsRead, fetchNotifications, socket, markAllAsRead };
};

export default useNotifications;
