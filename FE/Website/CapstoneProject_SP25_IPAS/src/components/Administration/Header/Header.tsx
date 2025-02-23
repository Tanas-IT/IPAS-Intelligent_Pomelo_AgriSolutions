import { Avatar, Button, Col, Flex, Popover, Row, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
const { Text } = Typography;

import style from "./Header.module.scss";
import { getCurrentDate, getRoleName } from "@/utils";
import { Icons, Images } from "@/assets";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "@/hooks";
import { useSidebarStore } from "@/stores";
import { SearchHeader } from "@/components";
import Notification from "./Notification";

interface HeaderProps {
  isDefault?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isDefault = false }) => {
  const { isExpanded } = useSidebarStore();
  const { getAuthData } = useLocalStorage();
  const authData = getAuthData();

  const menuItems = [
    { label: "Hồ sơ cá nhân", path: "/profile" },
    { label: "Cài đặt tài khoản", path: "/settings" },
  ];

  const navigate = useNavigate();

  const handleClick = (path: string) => {
    navigate(path);
  };

  const profileContent = (
    <div className={style.popupContainer}>
      <Flex className={style.popupNav}>
        {menuItems.map((item, index) => (
          <Flex key={index} onClick={() => handleClick(item.path)} className={style.popupSubNav}>
            <Text>{item.label}</Text>
          </Flex>
        ))}
      </Flex>
    </div>
  );

  const notificationContent = (
    <div>
      <h4>Notifications</h4>
      <p>No new notifications</p>
    </div>
  );

  const notifications = [
    { icon: <Icons.language />, content: notificationContent },
    !isDefault ? { icon: <Icons.regBell />, content: notificationContent } : null,
  ].filter((noti) => noti !== null);

  return (
    <Flex className={`${style.header} ${!isExpanded && style.collapsed}`}>
      <Flex className={style.content}>
        <Flex className={style.leftSection}>
          <Text className={style.welcomeMessage}>Welcome back, {authData.fullName}</Text>
          <Flex className={style.dateWrapper}>
            <Icons.calendar className={style.dateIcon} />
            <Text className={style.dateText}>{getCurrentDate()}</Text>
          </Flex>
        </Flex>
        <Flex className={`${style.rightSection} ${isDefault ? style.paddingRight : ""}`}>
          <Flex className={style.searchWrapper}>
            <SearchHeader onSearch={(e) => e} />
          </Flex>
          <Flex className={style.notificationWrapper}>
            {/* {notifications.map((noti, index) => (
              <Popover key={index} content={noti.content} trigger="click" placement="bottomRight">
                <Button className={style.notificationButton}>{noti.icon}</Button>
              </Popover>
            ))} */}
            <Notification />
          </Flex>
          <Popover content={profileContent} trigger="click" placement="bottom">
            <Flex className={style.profileContainer}>
              {authData.avatar &&
              authData.avatar !== "null" &&
              authData.avatar !== "undefined" &&
              authData.avatar.trim() !== "" ? (
                <Avatar crossOrigin="anonymous" size={50} shape="square" src={authData.avatar} />
              ) : (
                <Avatar size={50} shape="square" icon={<UserOutlined />} />
              )}
              <Flex className={`${style.profileInfo}`}>
                <Text className={style.profileName}>{authData.fullName}</Text>
                {!isDefault && <Text className={style.profileRole}>{getRoleName()}</Text>}
              </Flex>
              <Icons.arrowDropDownLine className={style.dropdownIcon} />
            </Flex>
          </Popover>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Header;
