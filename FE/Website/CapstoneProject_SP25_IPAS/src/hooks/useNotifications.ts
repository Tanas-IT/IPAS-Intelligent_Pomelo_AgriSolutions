import { useEffect, useState } from "react";
import { notificationService } from "@/services";
import { getUserId } from "@/utils";
import { GetNotification } from "@/payloads";

export interface INotification {
  notificationID: number;
  title: string;
  content: string;
  link: string;
  isRead: boolean;
  masterType: {
    id: number;
    name: string;
    backgroundColor: string;
  };
  sender: {
    id: number;
    name: string;
    avatar: string;
  };
  date: string;
}

const useNotifications = () => {
  const [notifications, setNotifications] = useState<GetNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const userId = Number(getUserId());

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getNotificationByUser(userId);
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    setUnreadCount(notifications?.filter((n) => !n.isRead).length);
  }, [notifications]);

  // Kết nối WebSocket khi component mount
  useEffect(() => {
    if (!userId) return;

    const ws = new WebSocket(`${import.meta.env.VITE_PUBLIC_WS_URL}?userId=${userId}`);


    ws.onopen = () => {
      console.log("Connected to WebSocket!");
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Parsed Message:", message);


        fetchNotifications();
      } catch (error) {
        console.log("Error parse JSON:", error);
      }
    };


    ws.onclose = (event) => {
      // console.error("WebSocket disconnected:", event);
    };

    ws.onerror = (error) => {
      // console.error("WebSocket error:", error);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [userId]);

  const markAsRead = async (notificationID: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.notificationId === notificationID ? { ...n, isRead: true } : n))
    );

    try {
      await notificationService.markAsRead(userId, "once", notificationID);
    } catch (error) {
      console.error("Error marking notification as read", error);
  
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === notificationID ? { ...n, isRead: false } : n))
      );
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      await notificationService.markAsRead(userId);
    } catch (error) {
      console.error("Error marking notification as read", error);
  
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: false })));
    }
  };

  return { notifications, unreadCount, markAsRead, fetchNotifications, socket };
};

export default useNotifications;