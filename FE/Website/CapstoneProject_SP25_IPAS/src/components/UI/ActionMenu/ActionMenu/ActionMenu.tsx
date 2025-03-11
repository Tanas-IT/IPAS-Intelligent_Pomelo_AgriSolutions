import { Button, Divider, Flex, Popover, Space, Typography } from "antd";
import style from "./ActionMenu.module.scss";
import { Icons } from "@/assets";
import { useState } from "react";
import { ActionMenuItem } from "@/types";
const { Text } = Typography;

interface ActionMenuProps {
  title: string;
  items: ActionMenuItem[];
  visible?: boolean;
  setVisible?: (visible: boolean) => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ title, items, visible, setVisible }) => {
  const [internalVisible, setInternalVisible] = useState(false);

  // Nếu `visible` không được truyền từ ngoài, dùng state nội bộ
  const isControlled = visible !== undefined;
  const menuVisible = isControlled ? visible : internalVisible;
  const setMenuVisible = isControlled ? setVisible! : setInternalVisible;

  const popoverContent = (
    <div className={style.popoverContent}>
      <div className={style.popoverHeader}>
        <Text className={style.popoverHeaderTitle}>{title}</Text>
        <Divider className={style.divider} />
      </div>
      <div className={style.popoverBody}>
        {items.map((item, index) => (
          <div key={index}>
            <Space
              onClick={() => {
                item.onClick?.();
                if (item.isCloseOnClick !== false) {
                  setMenuVisible(false);
                }
              }}
              className={style.popupButton}
              direction="horizontal"
            >
              <Flex className={style.popupIcon}>{item.icon}</Flex>
              <Flex className={style.popupButtonText}>
                {typeof item.label === "string" ? <span>{item.label}</span> : item.label}
              </Flex>
            </Space>
            {index < items.length - 1 && <Divider className={style.divider} />}
          </div>
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
        open={menuVisible}
        onOpenChange={setMenuVisible}
        overlayInnerStyle={{
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)", 
          borderRadius: "8px", 
        }}
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
