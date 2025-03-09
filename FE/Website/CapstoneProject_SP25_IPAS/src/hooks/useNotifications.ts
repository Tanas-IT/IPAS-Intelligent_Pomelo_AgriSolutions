import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";

interface MasterType {
  id: number;
  name: string;
  backgroundColor: string;
}

interface Sender {
  id: number;
  name: string;
  avatar: string;
}

export interface INotification {
  notificationID: number;
  title: string;
  content: string;
  link: string;
  isRead: boolean;
  masterType: MasterType;
  sender: Sender;
  date: string;
}

const mockNotifications: INotification[] = [
  {
    notificationID: 1,
    title: "Nhiệm vụ mới được giao",
    content: "Bạn được giao một nhiệm vụ mới trong kế hoạch chăm sóc cây.",
    link: "/tasks/123",
    isRead: false,
    masterType: { id: 1, name: "Task Assignment", backgroundColor: "#E3F2FD" },
    sender: { id: 101, name: "Quản lý A", avatar: "/avatars/manager-a.png" },
    date: dayjs().format("YYYY-MM-DD"),
  },
  {
    notificationID: 2,
    title: "Thay đổi lịch trình",
    content: "Lịch trình chăm sóc cây đã được cập nhật.",
    link: "/plans/456",
    isRead: true,
    masterType: { id: 2, name: "Task Change", backgroundColor: "#FFF9C4" },
    sender: { id: 102, name: "Quản lý B", avatar: "/avatars/manager-b.png" },
    date: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
  },
  {
    notificationID: 3,
    title: "Cảnh báo thời tiết",
    content: "Dự báo có mưa lớn trong ngày mai, cần chú ý tưới tiêu.",
    link: "/weather-alerts",
    isRead: false,
    masterType: { id: 5, name: "Weather", backgroundColor: "#E1BEE7" },
    sender: { id: 103, name: "Hệ thống", avatar: "/icons/weather-alert.png" },
    date: dayjs().format("YYYY-MM-DD"),
  },
];

const useNotifications = () => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      // const { data } = await axios.get("/api/notifications");
      await new Promise((resolve) => setTimeout(resolve, 500));
      setNotifications(mockNotifications);
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

  const addNotification = (newNoti: INotification) => {
    setNotifications((prev) => [newNoti, ...prev]);
  };

  const markAsRead = async (notificationID: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.notificationID === notificationID ? { ...n, isRead: true } : n))
    );

    try {
      await axios.put(`/api/notifications/${notificationID}/read`);
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };

  return { notifications, unreadCount, addNotification, markAsRead, fetchNotifications };
};

export default useNotifications;
