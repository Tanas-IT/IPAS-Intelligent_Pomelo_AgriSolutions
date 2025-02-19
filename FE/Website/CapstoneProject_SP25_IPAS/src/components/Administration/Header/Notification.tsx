import { Avatar, Button, List, Popover, Badge, Typography, Flex } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useNotifications } from "@/hooks";
import style from "./Header.module.scss";
import { Icons } from "@/assets";

const { Text } = Typography;

const Notification = () => {
  const { notifications, unreadCount, addNotification, markAsRead } = useNotifications();

  const notificationContent = (
    <div className={style.notiContainer}>
      <Flex justify="space-between">
        <h3>Your notications</h3>
        <div><span className={style.icon}><Icons.markAsRead/></span>Mark all as read</div>
      </Flex>
      <List
        itemLayout="horizontal"
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} />}
              title={<Text>{item.message}</Text>}
              description={<Text>{item.timestamp}</Text>}
            />
            {!item.isRead && (
              <Button size="small" onClick={() => markAsRead(item.id)}>
                Đọc
              </Button>
            )}
          </List.Item>
        )}
      />
      <Button type="primary" onClick={() => addNotification("Bạn có thông báo mới!")} block>
        Thêm thông báo
      </Button>
    </div>
  );

  return (
    <Popover content={notificationContent} trigger="click" placement="bottomLeft">
      <Badge count={unreadCount}>
      <Button className={style.notificationButton}><Icons.regBell /></Button>
      </Badge>
    </Popover>
  );
};

export default Notification;
