import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
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
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

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

  // Kết nối SignalR WebSocket khi component mount
  useEffect(() => {
    if (!userId) return;

    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(import.meta.env.VITE_PUBLIC_WS_URL, {
        accessTokenFactory: () => localStorage.getItem("token") || "",
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    hubConnection
      .start()
      .then(() => {
        console.log("Connected to SignalR WebSocket!");
        console.log("📡 Trạng thái kết nối SignalR11111111:", hubConnection.state);


        hubConnection.on("ReceiveNotification", (newNotification: GetNotification) => {
          console.log("🔔 Nhận thông báo:", newNotification);
          setNotifications((prev) => [newNotification, ...prev]);
        });
        console.log("📡 Trạng thái kết nối SignalR2222222:", hubConnection.state);

      })
      .catch((err) => console.error("WebSocket connection error:", err));

    setConnection(hubConnection);

    hubConnection.onclose((error) => {
      console.error("❌ WebSocket bị ngắt kết nối:", error);
    });

    hubConnection.onreconnecting((error) => {
      console.warn("🔄 Đang thử kết nối lại SignalR...", error);
    });
    
    hubConnection.onreconnected((connectionId) => {
      console.log("✅ Đã kết nối lại SignalR với ID:", connectionId);
    });
    
    
    

    return () => {
      hubConnection.stop();
    };
  }, [userId]);

  // đánh dấu thông báo là đã đọc
  const markAsRead = async (notificationID: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.notificationId === notificationID ? { ...n, isRead: true } : n))
    );

    try {
      if (connection) {
        await connection.invoke("MarkNotificationAsRead", { userId, notificationId: notificationID });
      }
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };

  return { notifications, unreadCount, markAsRead, fetchNotifications };
};

export default useNotifications;
