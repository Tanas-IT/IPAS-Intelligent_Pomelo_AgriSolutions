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

    const ws = new WebSocket(import.meta.env.VITE_PUBLIC_WS_URL);

    ws.onopen = () => {
      console.log("Connected to WebSocket!");
      // Gửi thông tin xác thực nếu cần
      ws.send(JSON.stringify({ type: "authenticate", token: localStorage.getItem("token") }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "notification") {
        const newNotification: GetNotification = message.data;
        console.log("🔔 Nhận thông báo:", newNotification);
        setNotifications((prev) => [newNotification, ...prev]);
      }
    };

    ws.onclose = (event) => {
      console.error("❌ WebSocket bị ngắt kết nối:", event);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [userId]);

  // đánh dấu thông báo là đã đọc
  const markAsRead = async (notificationID: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.notificationId === notificationID ? { ...n, isRead: true } : n))
    );

    try {
      if (socket) {
        socket.send(JSON.stringify({ type: "markAsRead", userId, notificationId: notificationID }));
      }
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };

  return { notifications, unreadCount, markAsRead, fetchNotifications };
};

export default useNotifications;