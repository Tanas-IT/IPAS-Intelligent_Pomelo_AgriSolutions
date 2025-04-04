import React, { useState, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    Image,
    FlatList,
    StyleSheet
} from 'react-native';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { GetNotification } from '@/types/notification';
import { useNotifications } from '@/hooks';
import { SegmentedControl } from 'components/SegmentedControl.tsx';
import BackButton from 'components/BackButton';
import { ROUTE_NAMES } from '@/navigation/RouteNames';
import { styles } from './Notification.styles';
import TextCustom from 'components/TextCustom';

type NotificationFilter = 'ALL' | 'UNREAD';

const NotificationScreen = () => {
    // const { notifications, unreadCount, markAsRead, fetchNotifications } = useNotifications();
    const [notifications, setNotifications] = useState<GetNotification[]>([
        {
            notificationId: 1,
            title: "Kế hoạch mới",
            content: "Kế hoạch chăm sóc cây tháng 4 vừa được tạo",
            isRead: false,
            createDate: "2025-03-28T10:27:32.127",
            color: "#2ecc71",
            link: "/plans/123",
            masterType: {
                masterTypeId: 36,
                masterTypeName: "Phân công nhiệm vụ"
            },
            sender: {
                id: 1,
                name: "Nguyễn Văn A",
                avt: "https://randomuser.me/api/portraits/men/1.jpg"
            }
        },
        {
            notificationId: 2,
            title: "Công việc mới",
            content: "Công việc kiểm tra đất vừa được giao",
            isRead: false,
            createDate: "2025-03-28T14:15:04.607",
            color: "#3498db",
            link: "/tasks/456",
            masterType: {
                masterTypeId: 37,
                masterTypeName: "Kiểm tra định kỳ"
            },
            sender: {
                id: 2,
                name: "Trần Thị B",
                avt: "https://randomuser.me/api/portraits/women/2.jpg"
            }
        },
        {
            notificationId: 3,
            title: "Cập nhật hệ thống",
            content: "Hệ thống đã được nâng cấp phiên bản mới",
            isRead: true,
            createDate: "2025-03-27T09:30:00.000",
            color: "#e67e22",
            link: "/system/update",
            masterType: {
                masterTypeId: 38,
                masterTypeName: "Thông báo hệ thống"
            },
            sender: {
                id: 0,
                name: "Hệ thống",
                avt: ""
            }
        }
    ]);
    const [filter, setFilter] = useState<NotificationFilter>('ALL');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            //   const response = await api.getNotifications();
            // setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            // await api.markNotificationAsRead(id);
            setNotifications(prev =>
                prev.map(n =>
                    n.notificationId === id ? { ...n, isRead: true } : n
                )
            );
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            // await api.markAllNotificationsAsRead();
            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true }))
            );
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const filteredNotifications = filter === 'ALL'
        ? notifications
        : notifications.filter(n => !n.isRead);

    const groupNotificationsByDate = (notifs: GetNotification[]) => {
        return notifs.reduce((acc, notification) => {
            const dateKey = dayjs(notification.createDate).format('DD/MM/YYYY');
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(notification);
            return acc;
        }, {} as Record<string, GetNotification[]>);
    };

    const handleItemPress = (notification: GetNotification) => {
        if (!notification.isRead) {
            markAsRead(notification.notificationId);
        }
        // có nên navigate to ?
        console.log(`Navigating to: ${notification.link}`);
    };

    const NotificationItem = ({ item }: { item: GetNotification }) => (
        <TouchableOpacity
            style={[styles.itemContainer, item.isRead && styles.readItem]}
            onPress={() => handleItemPress(item)}
        >
            <View style={styles.avatarContainer}>
                {item.sender.avt ? (
                    <Image source={{ uri: item.sender.avt }} style={styles.avatar} />
                ) : (
                    <View style={styles.defaultAvatar}>
                        <AntDesign name="user" size={20} color="#fff" />
                    </View>
                )}
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <TextCustom style={styles.title} numberOfLines={1}>{item.title}</TextCustom>
                    <TextCustom style={styles.time}>
                        {dayjs(item.createDate).format('HH:mm')}
                    </TextCustom>
                </View>

                <TextCustom style={styles.content} numberOfLines={2}>{item.content}</TextCustom>

                <View style={[styles.tag, { backgroundColor: item.color }]}>
                    <TextCustom style={styles.tagText}>{item.masterType.masterTypeName}</TextCustom>
                </View>
            </View>

            {!item.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    const groupedNotifications = groupNotificationsByDate(filteredNotifications);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.headerTopRow}>
                    <BackButton
                        targetScreen={ROUTE_NAMES.MAIN.DRAWER}
                        iconColor="#333"
                    />
                    <TextCustom style={styles.headerTitle}>Notifications</TextCustom>
                    <View style={styles.actionsRow}>
                        <TouchableOpacity onPress={fetchNotifications} style={styles.actionButton}>
                            <AntDesign name="reload1" size={20} color="#333" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={markAllAsRead} style={styles.actionButton}>
                            <MaterialIcons name="mark-as-unread" size={20} color="#333" />
                        </TouchableOpacity>
                    </View>
                </View>
                <SegmentedControl
                    options={['Tất cả', `Chưa đọc (${unreadCount})`]}
                    selectedOption={filter === 'ALL' ? 'Tất cả' : `Chưa đọc (${unreadCount})`}
                    onOptionPress={(option) => {
                        setFilter(option === 'Tất cả' ? 'ALL' : 'UNREAD');
                    }}
                />
            </View>

            {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <TextCustom style={styles.emptyText}>Không có thông báo nào</TextCustom>
                </View>
            ) : (
                <FlatList
                    data={Object.entries(groupedNotifications)}
                    keyExtractor={([date]) => date}
                    renderItem={({ item: [date, items] }) => (
                        <View style={styles.dateGroup}>
                            <TextCustom style={styles.dateHeader}>{date}</TextCustom>
                            {items.map((notification) => (
                                <NotificationItem
                                    key={notification.notificationId.toString()}
                                    item={notification}
                                />
                            ))}
                        </View>
                    )}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
};



export default NotificationScreen;