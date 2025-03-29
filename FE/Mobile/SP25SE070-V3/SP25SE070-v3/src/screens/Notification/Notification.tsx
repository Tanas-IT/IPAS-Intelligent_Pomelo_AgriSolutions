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
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.time}>
                        {dayjs(item.createDate).format('HH:mm')}
                    </Text>
                </View>

                <Text style={styles.content} numberOfLines={2}>{item.content}</Text>

                <View style={[styles.tag, { backgroundColor: item.color }]}>
                    <Text style={styles.tagText}>{item.masterType.masterTypeName}</Text>
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
                    <Text style={styles.headerTitle}>Notifications</Text>
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
                    <Text style={styles.emptyText}>Không có thông báo nào</Text>
                </View>
            ) : (
                <FlatList
                    data={Object.entries(groupedNotifications)}
                    keyExtractor={([date]) => date}
                    renderItem={({ item: [date, items] }) => (
                        <View style={styles.dateGroup}>
                            <Text style={styles.dateHeader}>{date}</Text>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fffcee',
    },
    headerContainer: {
        padding: 16,
        backgroundColor: '#fffcee',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
        alignItems: 'center',
        // marginTop: 30
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        textAlign: 'center',
        marginTop: 70
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 70
    },
    actionButton: {
        padding: 8,
    },
    filterContainer: {
        flexDirection: 'row',
        borderRadius: 8,
        backgroundColor: '#e9ecef',
        overflow: 'hidden',
    },
    filterButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
    },
    activeFilter: {
        backgroundColor: '#007bff',
    },
    filterText: {
        color: '#6c757d',
        fontWeight: '500',
    },
    activeFilterText: {
        color: '#fff',
    },
    listContainer: {
        paddingBottom: 16,
    },
    dateGroup: {
        marginTop: 16,
    },
    dateHeader: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        color: '#6c757d',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        color: '#6c757d',
        fontSize: 16,
    },
    itemContainer: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    readItem: {
        backgroundColor: '#f9f9f9',
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    defaultAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#007bff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
        flex: 1,
        marginRight: 8,
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
    content: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    tag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginTop: 4,
    },
    tagText: {
        fontSize: 12,
        color: '#fff',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#007bff',
        alignSelf: 'center',
        marginLeft: 8,
    },
});

export default NotificationScreen;