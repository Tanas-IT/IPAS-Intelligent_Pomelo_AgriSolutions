import { Avatar, Button, List, Popover, Badge, Typography, Flex, Tag, Segmented } from "antd";
import { UserOutlined, ReloadOutlined, MoreOutlined } from "@ant-design/icons";
import { useNotifications } from "@/hooks";
import style from "./Header.module.scss";
import { Icons } from "@/assets";
import { useRef, useState } from "react";
import dayjs from "dayjs";
import { GetNotification } from "@/payloads";
import UserAvatar from "@/components/UI/UserAvatar";

const { Text } = Typography;

const Notification = () => {
  const { notifications, unreadCount, markAsRead, fetchNotifications } = useNotifications();

  const popoverRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<"All" | "Unread">("All");

  const filteredNotifications =
    filter === "All" ? notifications : notifications.filter((n) => !n.isRead);

  const groupedNotifications = (filteredNotifications ?? []).reduce((acc, notification) => {
    const dateKey = dayjs(notification.createDate).format("DD/MM/YYYY");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(notification);
    return acc;
  }, {} as Record<string, GetNotification[]>);

  const markAllAsRead = () => {
    notifications.forEach((item) => {
      if (!item.isRead) {
        markAsRead(item.notificationId);
      }
    });
  };

  const moreOptions = (
    <div>
      <Button type="text" onClick={markAllAsRead}>
        Mark all as read
      </Button>
    </div>
  );

  const notificationContent = (
    <div className={style.notiContainer} ref={popoverRef}>
      <Flex justify="space-between" align="center">
        <h3>Notifications</h3>
        <Flex gap={8}>
          <Button type="text" icon={<ReloadOutlined />} onClick={fetchNotifications} />
          <Popover content={moreOptions} trigger="click" placement="bottomRight">
            <Button type="text" icon={<MoreOutlined />} />
          </Popover>
        </Flex>
      </Flex>

      <Segmented
        options={["All", "Unread"]}
        value={filter}
        onChange={(value) => setFilter(value as "All" | "Unread")}
        style={{ marginBottom: 8 }}
      />

      {Object.entries(groupedNotifications).length === 0 ? (
        <p>You don't have any notifications.</p>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={Object.entries(groupedNotifications)}
          renderItem={([date, items]) => (
            <div key={date}>
              <Text type="secondary" style={{ marginLeft: 16 }}>
                {date}
              </Text>
              {items.map((item) => (
                <List.Item
                  className={style.notificationItem}
                  key={item.notificationId}
                  onClick={() => markAsRead(item.notificationId)}
                >
                  <List.Item.Meta
                    avatar={<UserAvatar avatarURL={item.sender.avt || undefined} size={40} />}
                    title={
                      <Flex justify="space-between" align="center">
                        <div>
                          <Text strong>{item.title}</Text>
                          <Flex gap={4}>
                            <Tag color={item.color} style={{ color: "#333333" }}>
                              {item.masterType.masterTypeName}
                            </Tag>
                          </Flex>
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(item.createDate).format("HH:mm")}
                        </Text>
                      </Flex>
                    }
                    description={
                      <Text type="secondary" style={{ color: "#555" }}>
                        {item.content}
                      </Text>
                    }
                  />
                  <span
                    className={style.unreadDot}
                    style={{ color: item.isRead ? "#ffffff" : "blue" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!item.isRead) markAsRead(item.notificationId);
                    }}
                  >
                    ●
                  </span>
                </List.Item>
              ))}
            </div>
          )}
        />
      )}
    </div>
  );

  return (
    <Popover
      content={notificationContent}
      trigger="click"
      placement="bottomLeft"
      overlayStyle={{
        maxWidth: "350px",
        right: 300,
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
        borderRadius: "10px",
      }}
      getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
      destroyTooltipOnHide
    >
      <Badge count={unreadCount}>
        <Button className={style.notificationButton}>
          <Icons.regBell />
        </Button>
      </Badge>
    </Popover>
  );
};

export default Notification;
