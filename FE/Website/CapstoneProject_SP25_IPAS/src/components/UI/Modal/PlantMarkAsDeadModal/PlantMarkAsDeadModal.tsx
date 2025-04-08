import { Flex } from "antd";
import { useEffect } from "react";
import { ModalForm } from "@/components";
import style from "./PlantMarkAsDeadModal.module.scss";

type PlantMarkAsDeadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  isLoadingAction?: boolean;
  entityType?: "Plant" | "GraftedPlant";
};

const PlantMarkAsDeadModal = ({
  isOpen,
  onClose,
  onSave,
  isLoadingAction,
  entityType = "Plant",
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
      title={`Mark ${entityType} as Dead`}
      saveLabel="Apply"
      size={entityType === "Plant" ? "normalXL" : "normalXXL"}
    >
      <Flex vertical className={style.effectModal}>
        <label>
          When you mark this {entityType.toLowerCase()} as{" "}
          <span style={{ color: "red" }}>Dead</span>, the following changes will apply:
        </label>
        <ul className={style.effectList}>
          <li>
            The {entityType.toLowerCase()} will no longer be editable except for the{" "}
            <strong>Description</strong>.
          </li>
          <li>The {entityType.toLowerCase()} will be removed from all future farming actions.</li>
          <li>
            The {entityType.toLowerCase()}'s data will remain in the system for historical tracking.
          </li>
        </ul>
      </Flex>
    </ModalForm>
  );
};

export default PlantMarkAsDeadModal;
