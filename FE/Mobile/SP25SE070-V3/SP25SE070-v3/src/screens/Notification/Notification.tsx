// import React, { useState, useEffect } from "react";
// import {
//   View,
//   TouchableOpacity,
//   Text,
//   Image,
//   FlatList,
// } from "react-native";
// import { AntDesign, MaterialIcons } from "@expo/vector-icons";
// import dayjs from "dayjs";
// import { GetNotification } from "@/types/notification";
// import { ROUTE_NAMES } from "@/constants/RouteNames";
// import { styles } from "./Notification.styles";
// import { BackButton, SegmentedControl, TextCustom } from "@/components";
// import { getNotificationByUser, markAsRead } from "@/services/notificationService";
// import { useAuthStore } from "@/store";
// import { darkenColor } from "@/utils";
// import { NotificationService } from "@/services";
// import Toast from "react-native-toast-message";

// type NotificationFilter = "ALL" | "UNREAD";

// const NotificationScreen = () => {
//   const [notifications, setNotifications] = useState<GetNotification[]>([]);
//   const [filter, setFilter] = useState<NotificationFilter>("ALL");
//   const [loading, setLoading] = useState(false);
//   const { userId } = useAuthStore();

//   const fetchNotifications = async () => {
//     try {
//       setLoading(true);
//       const response = await NotificationService.getNotificationByUser(Number(userId), filter === "UNREAD" ? false : undefined);
//       console.log("111", response);

//       setNotifications(response.data || []);
//     } catch (error) {
//       console.error("Error fetching notifications:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const markAsReadHandler = async (notificationId: number) => {
//     try {
//       const res = await NotificationService.markAsRead(Number(userId), "once", notificationId);
//       console.log("read", res);
//       if (res.statusCode !== 200) {
//         Toast.show({
//           type: "error",
//           text1: "Mark as read failed",
//         });
//       }

//       setNotifications((prev) =>
//         prev.map((n) => (n.notificationId === notificationId ? { ...n, isRead: true } : n))
//       );
//       fetchNotifications();
//     } catch (error) {
//       console.error("Error marking as read:", error);
//     }
//   };

//   const markAllAsReadHandler = async () => {
//     try {
//       await markAsRead(Number(userId), "ALL");
//       setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
//     } catch (error) {
//       console.error("Error marking all as read:", error);
//     }
//   };

//   useEffect(() => {
//     fetchNotifications();
//   }, [filter]);

//   const filteredNotifications =
//     filter === "ALL" ? notifications : notifications.filter((n) => !n.isRead);

//   const groupNotificationsByDate = (notifs: GetNotification[]) => {
//     return notifs.reduce((acc, notification) => {
//       const dateKey = dayjs(notification.createDate).format("DD/MM/YYYY");
//       if (!acc[dateKey]) acc[dateKey] = [];
//       acc[dateKey].push(notification);
//       return acc;
//     }, {} as Record<string, GetNotification[]>);
//   };

//   const handleItemPress = (notification: GetNotification) => {
//     if (!notification.isRead) {
//       markAsReadHandler(notification.notificationId);
//     }
//     // Navigate nếu cần
//     console.log(`Navigating to: ${notification.link}`);
//     // TODO: Thêm navigation nếu dùng react-navigation
//     // navigation.navigate(...);
//   };

//   const NotificationItem = ({ item }: { item: GetNotification }) => (
//     <TouchableOpacity
//       style={[styles.itemContainer, item.isRead && styles.readItem]}
//       onPress={() => handleItemPress(item)}
//     >
//       <View style={styles.avatarContainer}>
//         {item.sender.avt ? (
//           <Image source={{ uri: item.sender.avt }} style={styles.avatar} />
//         ) : (
//           <View style={styles.defaultAvatar}>
//             <AntDesign name="user" size={20} color="#fff" />
//           </View>
//         )}
//       </View>

//       <View style={styles.contentContainer}>
//         <View style={styles.headerRow}>
//           <TextCustom style={styles.title} numberOfLines={1}>
//             {item.title}
//           </TextCustom>
//           <TextCustom style={styles.time}>
//             {dayjs(item.createDate).format("HH:mm")}
//           </TextCustom>
//         </View>

//         <TextCustom style={styles.content} numberOfLines={2}>
//           {item.content}
//         </TextCustom>

//         <View style={[styles.tag, { backgroundColor: item.color }]}>
//           <TextCustom style={[styles.tagText, { color: darkenColor(item.color) }]}>
//             {item.masterType.masterTypeName}
//           </TextCustom>
//         </View>
//       </View>

//       {!item.isRead && <View style={styles.unreadDot} />}
//     </TouchableOpacity>
//   );

//   const groupedNotifications = groupNotificationsByDate(filteredNotifications);
//   const unreadCount = notifications.filter((n) => !n.isRead).length;

//   return (
//     <View style={styles.container}>
//       <View style={styles.headerContainer}>
//         <View style={styles.headerTopRow}>
//           <BackButton targetScreen={ROUTE_NAMES.MAIN.DRAWER} iconColor="#333" />
//           <TextCustom style={styles.headerTitle}>Notifications</TextCustom>
//           <View style={styles.actionsRow}>
//             <TouchableOpacity
//               onPress={fetchNotifications}
//               style={styles.actionButton}
//               disabled={loading}
//             >
//               <AntDesign name="reload1" size={20} color={loading ? "#ccc" : "#333"} />
//             </TouchableOpacity>
//             <TouchableOpacity
//               onPress={markAllAsReadHandler}
//               style={styles.actionButton}
//               disabled={loading || unreadCount === 0}
//             >
//               <MaterialIcons name="mark-as-unread" size={20} color={loading || unreadCount === 0 ? "#ccc" : "#333"} />
//             </TouchableOpacity>
//           </View>
//         </View>
//         <SegmentedControl
//           options={["All", `Unread (${unreadCount})`]}
//           selectedOption={
//             filter === "ALL" ? "All" : `Unread (${unreadCount})`
//           }
//           onOptionPress={(option) => {
//             setFilter(option === "All" ? "ALL" : "UNREAD");
//           }}
//         />
//       </View>

//       {loading ? (
//         <View style={styles.emptyContainer}>
//           <TextCustom style={styles.emptyText}>Đang tải...</TextCustom>
//         </View>
//       ) : notifications.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <TextCustom style={styles.emptyText}>
//             Không có thông báo nào
//           </TextCustom>
//         </View>
//       ) : (
//         <FlatList
//           data={Object.entries(groupedNotifications)}
//           keyExtractor={([date]) => date}
//           renderItem={({ item: [date, items] }) => {

//             return (
//               <View style={styles.dateGroup}>
//                 <TextCustom style={styles.dateHeader}>{date}</TextCustom>
//                 {items.map((notification) => {
//                   console.log('🔔 Notification item:', notification);

//                   return (
//                     <NotificationItem
//                       key={notification.notificationId.toString()}
//                       item={notification}
//                     />
//                   );
//                 })}
//               </View>
//             );
//           }}
//           contentContainerStyle={styles.listContainer}
//         />

//       )}
//     </View>
//   );
// };

// export default NotificationScreen;


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

  const groupNotificationsByDate = (notifs: GetNotification[]) => {
    return notifs.reduce((acc, notification) => {
      const dateKey = dayjs(notification.createDate).format("DD/MM/YYYY");
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(notification);
      return acc;
    }, {} as Record<string, GetNotification[]>);
  };

  const handleItemPress = (notification: GetNotification) => {
    if (!notification.isRead) {
      markAsRead(notification.notificationId);
    }
    // Navigate nếu cần
    console.log(`Navigating to: ${notification.link}`);
  };

  const test = NotificationService.getNotificationByUser(Number(userId));
  console.log("testtttttttttt", test);
  

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
  );

  const groupedNotifications = groupNotificationsByDate(filteredNotifications);

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