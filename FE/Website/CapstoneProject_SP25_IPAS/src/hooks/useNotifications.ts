import { useState, useEffect } from "react";
import { notificationService } from "@/services";
import { getUserId } from "@/utils";
import { GetNotification } from "@/payloads";
import { io, Socket } from "socket.io-client";

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
  const [socket, setSocket] = useState<Socket | null>(null);

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
    setUnreadCount(notifications.filter((n) => !n.isRead).length);
  }, [notifications]);

  // Kết nối WebSocket khi component mount
  useEffect(() => {
    if (!userId) return;

    const newSocket = io(import.meta.env.NEXT_PUBLIC_WS_URL || "http://localhost:5000", {
      query: { userId: userId.toString() },
    });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    // Nhận thông báo mới từ server
    newSocket.on("ReceiveNotification", (newNotification: GetNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  // đánh dấu thông báo là đã đọc
  const markAsRead = async (notificationID: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.notificationId === notificationID ? { ...n, isRead: true } : n))
    );

    try {
      if (socket) {
        socket.emit("MarkNotificationAsRead", { userId, notificationId: notificationID });
      }
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };

  return { notifications, unreadCount, markAsRead, fetchNotifications };
};

export default useNotifications;
