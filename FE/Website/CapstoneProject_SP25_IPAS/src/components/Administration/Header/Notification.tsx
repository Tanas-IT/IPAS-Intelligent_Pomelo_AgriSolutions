import { Avatar, Button, List, Popover, Badge, Typography, Flex, Spin, Tag, Segmented } from "antd";
import { UserOutlined, ReloadOutlined, MoreOutlined } from "@ant-design/icons";
import { useNotifications } from "@/hooks";
import style from "./Header.module.scss";
import { Icons } from "@/assets";
import { useRef, useState } from "react";
import dayjs from "dayjs";
import { INotification } from "@/hooks/useNotifications";

const { Text } = Typography;

const Notification = () => {
  const { notifications, unreadCount, markAsRead, fetchNotifications } = useNotifications();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<"All" | "Unread">("All");

  const filteredNotifications = filter === "All" ? notifications : notifications.filter((n) => !n.isRead);

  const groupedNotifications = filteredNotifications.reduce((acc, notification) => {
    const dateKey = dayjs(notification.date).format("DD/MM/YYYY");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(notification);
    return acc;
  }, {} as Record<string, INotification[]>);

  const markAllAsRead = () => {
    notifications.forEach((item) => {
      if (!item.isRead) {
        markAsRead(item.notificationID);
      }
    });
  };

  const moreOptions = (
    <div>
      <Button type="text" onClick={markAllAsRead}>Mark all as read</Button>
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
        <Spin size="small" />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={Object.entries(groupedNotifications)}
          renderItem={([date, items]) => (
            <div>
              <Text type="secondary" style={{ marginLeft: 16 }}>{date}</Text>
              {items.map((item) => (
                <List.Item className={style.notificationItem} key={item.notificationID} onClick={() => markAsRead(item.notificationID)}>
                  <List.Item.Meta
                    avatar={<Avatar src={item.sender.avatar} icon={!item.sender.avatar ? <UserOutlined /> : undefined} />}
                    title={
                      <Flex justify="space-between" gap={8} vertical={false}>
                        <Flex vertical>
                          <Text style={{ whiteSpace: "nowrap" }}>{item.title}</Text>
                          <Flex>
                            <Tag color={item.masterType.backgroundColor}>{item.masterType.name}</Tag>
                          </Flex>
                        </Flex>
                        <p style={{ color: "#444", fontWeight: "lighter" }}>ngày</p>
                      </Flex>
                    }
                    description={<Text type="secondary">{item.content}</Text>}
                  />
                  {!item.isRead && (
                    <span className={style.unreadDot} onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(item.notificationID);
                    }}>●</span>
                  )}
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
      overlayStyle={{ maxWidth: "350px" }}
      getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
      destroyTooltipOnHide
    >
      <Badge count={unreadCount}>
        <Button className={style.notificationButton}><Icons.regBell /></Button>
      </Badge>
    </Popover>
  );
};

export default Notification;
