import React from "react";
import {
  View,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { GetNotification } from "@/types/notification";
import { ROUTE_NAMES } from "@/constants/RouteNames";
import { styles } from "./Notification.styles";
import { BackButton, SegmentedControl, TextCustom } from "@/components";
import { useAuthStore } from "@/store";
import { darkenColor } from "@/utils";
import Toast from "react-native-toast-message";
import useNotifications from "@/hooks/useNotifications";
import { NotificationService } from "@/services";

type NotificationFilter = "ALL" | "UNREAD";

const NotificationScreen = () => {
  const { userId } = useAuthStore();
  const [filter, setFilter] = React.useState<NotificationFilter>("ALL");
  const {
    notifications,
    unreadCount,
    markAsRead,
    fetchNotifications,
    markAllAsRead,
  } = useNotifications();

  const filteredNotifications =
    filter === "ALL" ? notifications : notifications.filter((n) => !n.isRead);


  const groupAndSortNotifications = (notifs: GetNotification[]) => {
    // sort all notification từ mới đến cũ
    const sortedNotifications = [...notifs].sort((a, b) => 
      dayjs(b.createDate).unix() - dayjs(a.createDate).unix()
    );

    // group theo date
    const grouped = sortedNotifications.reduce((acc, notification) => {
      const dateKey = dayjs(notification.createDate).format("DD/MM/YYYY");
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(notification);
      return acc;
    }, {} as Record<string, GetNotification[]>);

    // sort các group date từ mới đến cũ
    const sortedGroupKeys = Object.keys(grouped).sort((a, b) => {
      const dateA = dayjs(a, "DD/MM/YYYY");
      const dateB = dayjs(b, "DD/MM/YYYY");
      return dateB.unix() - dateA.unix();
    });

    const sortedGroups = sortedGroupKeys.map(date => ({
      date,
      items: grouped[date]
    }));

    return sortedGroups;
  };

  const handleItemPress = (notification: GetNotification) => {
    if (!notification.isRead) {
      markAsRead(notification.notificationId);
    }
  };

  const test = NotificationService.getNotificationByUser(Number(userId));

  const NotificationItem = ({ item }: { item: GetNotification }) => {
    return (
    <TouchableOpacity
      style={[styles.itemContainer, item.isRead && styles.readItem]}
      onPress={() => handleItemPress(item)}
    >
      {/* <View style={styles.avatarContainer}>
        {item?.sender?.avt ? (
          <Image source={{ uri: item?.sender?.avt }} style={styles.avatar} />
        ) : (
          <View style={styles.defaultAvatar}>
            <AntDesign name="user" size={20} color="#fff" />
          </View>
        )}
      </View> */}

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <TextCustom style={styles.title} numberOfLines={1}>
            {item.title}
          </TextCustom>
          <TextCustom style={styles.time}>
            {dayjs(item.createDate).format("HH:mm")}
          </TextCustom>
        </View>

        <TextCustom style={styles.content} numberOfLines={2}>
          {item.content}
        </TextCustom>

        <View style={[styles.tag, { backgroundColor: item.color }]}>
          <TextCustom style={[styles.tagText, { color: darkenColor(item.color) }]}>
            {item.masterType.masterTypeName}
          </TextCustom>
        </View>
      </View>

      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  )};

  const groupedNotifications = groupAndSortNotifications(filteredNotifications);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <BackButton targetScreen={ROUTE_NAMES.MAIN.DRAWER} iconColor="#333" />
          <TextCustom style={styles.headerTitle}>Notifications</TextCustom>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={fetchNotifications}
              style={styles.actionButton}
            >
              <AntDesign name="reload1" size={20} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => markAllAsRead()}
              style={styles.actionButton}
              disabled={unreadCount === 0}
            >
              <MaterialIcons 
                name="mark-as-unread" 
                size={20} 
                color={unreadCount === 0 ? "#ccc" : "#333"} 
              />
            </TouchableOpacity>
          </View>
        </View>
        <SegmentedControl
          options={["All", `Unread (${unreadCount})`]}
          selectedOption={filter === "ALL" ? "All" : `Unread (${unreadCount})`}
          onOptionPress={(option) => {
            setFilter(option === "All" ? "ALL" : "UNREAD");
          }}
        />
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <TextCustom style={styles.emptyText}>
            No notifications
          </TextCustom>
        </View>
      ) : (
        <FlatList
          data={groupedNotifications}
          keyExtractor={({ date }) => date}
          renderItem={({ item: { date, items } }) => (
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