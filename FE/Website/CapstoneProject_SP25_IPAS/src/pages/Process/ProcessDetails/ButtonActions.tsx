import { Button, Modal, Tooltip } from "antd";
import { Icons } from "@/assets";
import { useState } from "react";
import { toast } from "react-toastify";
import style from "./ProcessDetails.module.scss";
import { ConfirmModal } from "@/components";

interface ButtonActionsProps {
  editingKey: string | null;
  nodeKey: string;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAdd: () => void;
  onAddPlan?: (key: string) => void;
}

const ButtonActions: React.FC<ButtonActionsProps> = ({
  editingKey,
  nodeKey,
  onSave,
  onCancel,
  onEdit,
  onDelete,
  onAdd,
  onAddPlan,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleDelete = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    onDelete();
    setIsModalVisible(false);
    toast.success("Task deleted successfully!");
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="extra-buttons">
      {editingKey === nodeKey ? (
        <>
          <Tooltip title="Save">
            <Button icon={<Icons.tick />} onClick={onSave} size="small" />
          </Tooltip>
          <Tooltip title="Cancel">
            <Button icon={<Icons.close />} onClick={onCancel} size="small" />
          </Tooltip>
        </>
      ) : (
        <>
          {onAddPlan && (
            <Tooltip title="Add Plan">
              <Button icon={<Icons.addPLan />} onClick={() => onAddPlan(nodeKey)} size="small" />
            </Tooltip>
          )}

          <Tooltip title="Add Task">
            <Button icon={<Icons.plus />} onClick={onAdd} size="small" />
          </Tooltip>
          <Tooltip title="Edit Task">
            <Button icon={<Icons.edit />} onClick={onEdit} size="small" />
          </Tooltip>
          <Tooltip title="Delete Task">
            <Button icon={<Icons.delete />} onClick={handleDelete} size="small" />
          </Tooltip>
        </>
      )}

      <ConfirmModal
        visible={isModalVisible}
        onConfirm={handleOk}
        onCancel={handleCancel}
        itemName="Task"
        actionType="delete"
      />
    </div>
  );
};

export default ButtonActions;
