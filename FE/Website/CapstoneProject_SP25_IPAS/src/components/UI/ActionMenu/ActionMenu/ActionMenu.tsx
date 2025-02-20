import { Button, Divider, Flex, Popover, Space, Typography } from "antd";
import style from "./ActionMenu.module.scss";
import { Icons } from "@/assets";
import { useState } from "react";
const { Text } = Typography;

interface ActionMenuItem {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

interface ActionMenuProps {
  title: string;
  items: ActionMenuItem[];
}

const ActionMenu: React.FC<ActionMenuProps> = ({ title, items }) => {
  const [popoverVisible, setPopoverVisible] = useState(false);

  const handlePopoverVisibleChange = (visible: boolean) => {
    setPopoverVisible(visible);
  };
  const popoverContent = (
    <div className={style.popoverContent}>
      <div className={style.popoverHeader}>
        <Text className={style.popoverHeaderTitle}>{title}</Text>
        <Divider className={style.divider} />
      </div>
      <div className={style.popoverBody}>
        {items.map((item, index) => (
          <>
            <Space
              key={index}
              onClick={() => {
                item.onClick();
                setPopoverVisible(false); // Đóng Popover khi click
              }}
              className={style.popupButton}
              direction="horizontal"
            >
              <Flex className={style.popupIcon}>{item.icon}</Flex>
              <Flex className={style.popupButtonText}>{item.label}</Flex>
            </Space>
            {index < items.length - 1 && <Divider className={style.divider} />}
          </>
        ))}
      </div>
    </div>
  );

  return (
    <Flex className={style.settingItem}>
      <Popover
        content={popoverContent}
        trigger="click"
        placement="bottomRight"
        visible={popoverVisible}
        onVisibleChange={handlePopoverVisibleChange}
      >
        <Button className={style.settingsIconBtn}>
          <Flex>
            <Icons.dot className={style.settingsIcon} />
          </Flex>
        </Button>
      </Popover>
    </Flex>
  );
};

export default ActionMenu;
