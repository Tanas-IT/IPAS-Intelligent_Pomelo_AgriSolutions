import { Button, Divider, Flex, Modal, Popover } from "antd";
import { useEffect, useState } from "react";
import style from "./ActionBar.module.scss";
import { Icons } from "@/assets";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import { useModal } from "@/hooks";

interface ActionBarProps {
  selectedCount: number;
  deleteSelectedItems: () => void;
}

const ActionBar: React.FC<ActionBarProps> = ({ selectedCount, deleteSelectedItems }) => {
  const [isVisible, setIsVisible] = useState(false);
  const deleteConfirmModal = useModal();

  useEffect(() => {
    setIsVisible(selectedCount > 0);
  }, [selectedCount]);

  if (!isVisible) return null;

  const handleDeleteSelectedItems = () => {
    deleteSelectedItems();
    deleteConfirmModal.hideModal();
  };

  const showModal = () => {
    deleteConfirmModal.showModal();
  };

  // const showActionPopup = () => {
  //   setIsActionPopupVisible(true); // Hiển thị popup khi bấm "Actions"
  // };

  const handleCancel = () => {
    deleteConfirmModal.hideModal();
  };

  const actionContent = (
    <div className={style.popover_content}>
      <Button className={style.action_popup_btn} onClick={showModal}>
        Delete Items
      </Button>
      {/* Thêm các hành động khác nếu cần */}
    </div>
  );

  return (
    <>
      <Flex className={style.action_bar_container}>
        <Flex className={`${style.action_bar_content} ${!isVisible ? style.hide : ""}`}>
          <Flex className={style.action_bar_selected}>
            <Flex className={style.number_selected_round}>
              <span className={style.number}>{selectedCount} </span>
            </Flex>
            <Flex className={style.text_selected}>items selected</Flex>
          </Flex>

          <Flex className={style.divider_container}>
            <Divider className={style.divider} type="vertical" />
          </Flex>

          <Button
            className={style.action_bar_btn_delete}
            icon={<Icons.delete />}
            onClick={showModal}
          >
            Delete items
          </Button>

          {/* <Popover content={actionContent} trigger="click" placement="bottom">
            <Button className={style.action_bar_btn_actions}>
              Actions <Icons.arrowDown />
            </Button>
          </Popover> */}
        </Flex>
      </Flex>

      <ConfirmModal
        visible={deleteConfirmModal.modalState.visible}
        onConfirm={handleDeleteSelectedItems}
        onCancel={handleCancel}
        title="Delete Selected Items?"
        description={`Are you sure you want to delete the ${selectedCount} selected items? This action cannot be undone.
        Deleting these items may impact other related items.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
      />
    </>
  );
};

export default ActionBar;
