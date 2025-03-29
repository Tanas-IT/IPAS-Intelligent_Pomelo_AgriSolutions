import { useEffect, useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import Toast from 'react-native-toast-message';
import { ROUTE_NAMES } from '@/navigation/RouteNames';
import { CommonActions } from '@react-navigation/native';
import { GetNotification } from '@/types/notification';
import { notificationService } from '@/services';

const WS_URL = Config.WS_URL;

const useNotifications = () => {
  const [notifications, setNotifications] = useState<GetNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const navigation = useNavigation();

  const fetchUserId = async () => {
    const userId = await AsyncStorage.getItem('userId');
    return userId ? Number(userId) : null;
  };

  const fetchNotifications = useCallback(async () => {
    const userId = await fetchUserId();
    if (!userId) {
      Toast.show({ type: 'error', text1: 'userId not found' });
      return;
    }

    try {
      const response = await notificationService.getNotificationByUser(userId);
      if (response.statusCode === 200) {
        setNotifications(response.data);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'error fethcing notifications',
        text2: 'Please try again later',
      });
      if (error.response?.status === 401) {
        await AsyncStorage.clear();
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: ROUTE_NAMES.AUTH.LOGIN }],
          })
        );
      }
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.isRead).length);
  }, [notifications]);

  useEffect(() => {
    const setupWebSocket = async () => {
      const userId = await fetchUserId();
      if (!userId) return;

      const ws = new WebSocket(`${WS_URL}?userId=${userId}`);

      ws.onopen = () => {
        console.log('Connected to WebSocket!');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Parsed Message:', message);
          fetchNotifications();
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      setSocket(ws);

      return () => {
        ws.close();
      };
    };

    setupWebSocket();
  }, []);

  const markAsRead = useCallback(async (notificationId: number) => {
    const userId = await fetchUserId();
    if (!userId) return;

    setNotifications(prev =>
      prev.map(n => (n.notificationId === notificationId ? { ...n, isRead: true } : n))
    );

    try {
      const response = await notificationService.markAsRead(userId, 'once', notificationId);
      if (response.statusCode !== 200) throw new Error('Failed to mark as read');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to mark as read',
      });
      setNotifications(prev =>
        prev.map(n => (n.notificationId === notificationId ? { ...n, isRead: false } : n))
      );
      if (error.response?.status === 401) {
        await AsyncStorage.clear();
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: ROUTE_NAMES.AUTH.LOGIN }],
          })
        );
      }
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const userId = await fetchUserId();
    if (!userId) return;

    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    try {
      const response = await notificationService.markAsRead(userId);
      if (response.statusCode !== 200) throw new Error('Failed to mark all as read');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to mark all as read',
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: false })));
      if (error.response?.status === 401) {
        await AsyncStorage.clear();
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: ROUTE_NAMES.AUTH.LOGIN }],
          })
        );
      }
    }
  }, []);

  return { notifications, unreadCount, markAsRead, fetchNotifications, socket };
};

export default useNotifications;