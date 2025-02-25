import { Button, Modal, Tooltip } from "antd";
import { Icons } from "@/assets";
import { useState } from "react";
import { toast } from "react-toastify";
import style from "./ProcessDetails.module.scss";

interface ButtonActionsProps {
    editingKey: string | null;
    nodeKey: string;
    onSave: () => void;
    onCancel: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onAdd: () => void;
    onAddPlan: (key: string) => void;
}

const ButtonActions: React.FC<ButtonActionsProps> = ({
    editingKey,
    nodeKey,
    onSave,
    onCancel,
    onEdit,
    onDelete,
    onAdd,
    onAddPlan
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
                    <Tooltip title="Add Plan">
                        <Button icon={<Icons.addPLan />} onClick={() => onAddPlan(nodeKey)} size="small" />
                    </Tooltip>
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

            <Modal
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                centered
                width={400}
                footer={[
                    <Button
                        key="no"
                        className={style.noButton}
                        onClick={handleCancel}>
                        No
                    </Button>,
                    <Button
                        key="yes"
                        className={style.yesButton}
                        onClick={handleOk}>
                        Yes
                    </Button>
                ]}
            >
                <div className={style.modal}>
                    <Icons.warning className={style.icon}/>
                    <h3 className={style.confirmTitle}>
                        Are you sure?
                    </h3>
                    <p className={style.descDelete}>
                        Deleting this task will remove it permanently. Please confirm if you want to continue.
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default ButtonActions;
