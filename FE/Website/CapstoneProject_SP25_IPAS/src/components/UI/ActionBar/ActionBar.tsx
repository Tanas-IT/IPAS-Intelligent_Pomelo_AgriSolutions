import { Button, Divider, Dropdown, Flex, MenuProps, Modal, Popover } from "antd";
import { useEffect, useState } from "react";
import style from "./ActionBar.module.scss";
import { Icons } from "@/assets";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import { useModal } from "@/hooks";

interface ActionBarProps {
  selectedCount: number;
  deleteSelectedItems: () => void;
  onApplyCriteria?: () => void;
  onGroupGraftedPlant?: () => void;
  onUnGroupGraftedPlant?: () => void;
}

const ActionBar: React.FC<ActionBarProps> = ({
  selectedCount,
  deleteSelectedItems,
  onApplyCriteria,
  onGroupGraftedPlant,
  onUnGroupGraftedPlant,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const deleteConfirmModal = useModal();
  const unGroupConfirmModal = useModal();

  useEffect(() => {
    setIsVisible(selectedCount > 0);
  }, [selectedCount]);

  if (!isVisible) return null;

  const handleDeleteSelectedItems = () => {
    deleteSelectedItems();
    deleteConfirmModal.hideModal();
  };

  const handleUnGroupSelectedItems = () => {
    onUnGroupGraftedPlant?.();
    unGroupConfirmModal.hideModal();
  };

  const showModal = () => deleteConfirmModal.showModal();
  const showUnGroupModal = () => unGroupConfirmModal.showModal();
  const handleCancel = () => deleteConfirmModal.hideModal();

  const moreActionsItems: MenuProps["items"] = [
    onApplyCriteria && {
      key: "criteria",
      label: "Apply Criteria",
      icon: <Icons.criteria />,
      onClick: () => onApplyCriteria?.(),
    },
    onGroupGraftedPlant && {
      key: "group",
      label: "Group Grafted Plant to Lot",
      icon: <Icons.box />,
      onClick: () => onGroupGraftedPlant?.(),
    },
    onUnGroupGraftedPlant && {
      key: "ungroup",
      label: "UnGroup Grafted Plant from Lot",
      icon: <Icons.delete />,
      onClick: showUnGroupModal,
    },
  ].filter(Boolean) as MenuProps["items"];

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
          <Flex gap={20}>
            <Button
              className={style.action_bar_btn_delete}
              icon={<Icons.delete />}
              onClick={showModal}
            >
              Delete items
            </Button>

            {/* More Actions - Dropdown */}
            {(onApplyCriteria || onGroupGraftedPlant || onUnGroupGraftedPlant) && (
              <Dropdown
                menu={{ items: moreActionsItems, className: style.customDropdownMenu }}
                trigger={["click"]}
              >
                <Button className={style.action_bar_btn_more} icon={<Icons.plus />}>
                  More Actions
                </Button>
              </Dropdown>
            )}
          </Flex>
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
      {/* Confirm remove from lot Modal */}
      <ConfirmModal
        visible={unGroupConfirmModal.modalState.visible}
        onConfirm={handleUnGroupSelectedItems}
        onCancel={unGroupConfirmModal.hideModal}
        title="UnGroup Grafted Plant from Lot"
        description="Are you sure you want to ungroup the selected grafted plants from the lot? This action will not delete the plants but will unassign them from the current lot."
        confirmText="UnGroup"
        cancelText="Cancel"
        isDanger={true}
      />
    </>
  );
};

export default ActionBar;
