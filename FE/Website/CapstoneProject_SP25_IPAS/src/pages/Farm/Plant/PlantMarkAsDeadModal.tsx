import { Flex } from "antd";
import { useState, useEffect } from "react";
import { ModalForm } from "@/components";
import style from "./PlantList.module.scss";
import { toast } from "react-toastify";

type PlantMarkAsDeadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  isLoadingAction?: boolean;
};

const PlantMarkAsDeadModal = ({
  isOpen,
  onClose,
  onSave,
  isLoadingAction,
}: PlantMarkAsDeadModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
  }, [isOpen]);

  const handleSave = () => {
    onSave();
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={() => onClose()}
      onSave={handleSave}
      isLoading={isLoadingAction}
      title={"Mark Plant as Dead"}
      saveLabel="Apply"
      size="normalXL"
    >
      <Flex vertical className={style.effectModal}>
        <label>
          When you mark this plant as <span style={{ color: "red" }}>Dead</span>, the following
          changes will apply:
        </label>
        <ul className={style.effectList}>
          <li>
            The plant will no longer be editable except for the <strong>Description</strong>.
          </li>
          <li>The plant will be removed from all future farming actions.</li>
          <li>The plant's data will remain in the system for historical tracking.</li>
        </ul>
      </Flex>
    </ModalForm>
  );
};

export default PlantMarkAsDeadModal;
