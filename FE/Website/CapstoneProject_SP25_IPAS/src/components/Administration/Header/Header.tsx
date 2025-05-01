import { Avatar, Flex, Popover, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
const { Text } = Typography;

import style from "./Header.module.scss";
import { getCurrentDate, getRoleName } from "@/utils";
import { Icons } from "@/assets";
import { useNavigate } from "react-router-dom";
import { useSidebarStore, useUserStore } from "@/stores";
import { SearchHeader } from "@/components";
import Notification from "./Notification";
import { PATHS } from "@/routes";

interface HeaderProps {
  isDefault?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isDefault = false }) => {
  const { isExpanded } = useSidebarStore();
  // const { getAuthData } = useLocalStorage();
  // const authData = getAuthData();
  const { fullName, avatar } = useUserStore();

  const menuItems = [{ label: "Account Profile", path: PATHS.ACCOUNT.PROFILE }];

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

  return (
    <Flex className={`${style.header} ${!isExpanded && style.collapsed}`}>
      <Flex className={style.content}>
        <Flex className={style.leftSection}>
          <Text className={style.welcomeMessage}>Welcome back, {fullName}</Text>
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
            <Notification />
          </Flex>
          <Popover content={profileContent} trigger="click" placement="bottom">
            <Flex className={style.profileContainer}>
              {avatar && avatar !== "null" && avatar !== "undefined" && avatar.trim() !== "" ? (
                <Avatar crossOrigin="anonymous" size={50} shape="square" src={avatar} />
              ) : (
                <Avatar size={50} shape="square" icon={<UserOutlined />} />
              )}
              <Flex className={`${style.profileInfo}`}>
                <Text className={style.profileName}>{fullName}</Text>
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
