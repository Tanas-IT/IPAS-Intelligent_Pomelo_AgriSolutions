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
      console.log("📩 Raw WebSocket Message:", event.data);
      try {
        const message = JSON.parse(event.data);
        console.log("📩 Parsed Message:", message);

        if (message.type === "notification") {
          console.log("🔔 Nhận thông báo:", message.data);
          setNotifications((prev) => [message.data, ...prev]);
          fetchNotifications();
        }
      } catch (error) {
        console.error("❌ Lỗi parse JSON:", error);
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

  return { notifications, unreadCount, markAsRead, fetchNotifications, socket };
};

export default useNotifications;