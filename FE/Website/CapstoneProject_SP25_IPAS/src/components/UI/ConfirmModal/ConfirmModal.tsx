import React from "react";
import { Modal, Button } from "antd";
import style from "./ConfirmModal.module.scss";
import { Icons } from "@/assets";

interface ConfirmModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  itemName?: string;
  actionType?: "delete" | "update" | "unsaved" | "error";
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  errorMessages?: string[];
  noCancel?: boolean;
}

const generateMessages = (
  actionType: "delete" | "update" | "unsaved" | "error",
  itemName?: string,
) => {
  if (actionType === "unsaved") {
    return {
      title: "Unsaved Changes",
      description: "You have unsaved changes. Are you sure you want to close?",
    };
  }

  if (actionType === "error") {
    return {
      title: "An Error Occurred",
      description: "Something went wrong. Please review the errors below.",
    };
  }

  if (!itemName) {
    return {
      title: "Are you sure?",
      description: "This action cannot be undone. Please confirm if you want to proceed.",
    };
  }

  return {
    title: `${actionType === "delete" ? "Delete" : "Update"} ${itemName}?`,
    description: `Are you sure you want to ${actionType} this ${itemName}? This action cannot be undone.`,
  };
};

const generateButtonTexts = (actionType: "delete" | "update" | "unsaved" | "error") => {
  const buttonTexts = {
    delete: {
      confirmText: "Delete",
      cancelText: "Cancel",
    },
    update: {
      confirmText: "Save Changes",
      cancelText: "Cancel",
    },
    unsaved: {
      confirmText: "Yes",
      cancelText: "Cancel",
    },
    error: {
      confirmText: "Close",
      cancelText: "Retry",
    },
  };

  return buttonTexts[actionType] || buttonTexts.update;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  onConfirm,
  onCancel,
  itemName,
  actionType = "update",
  title,
  description,
  confirmText,
  cancelText,
  isDanger,
  errorMessages,
  noCancel = false,
}) => {
  const { title: generatedTitle, description: generatedDescription } = generateMessages(
    actionType,
    itemName,
  );
  const { confirmText: generatedConfirmText, cancelText: generatedCancelText } =
    generateButtonTexts(actionType);

  // Tự động đặt isDanger = true nếu actionType là delete
  const danger = actionType === "delete" ? true : isDanger ?? false;

  return (
    <Modal
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      className={style.modalContainer}
      footer={[
        !noCancel && (
          <Button key="no" className={style.noButton} onClick={onCancel}>
            {cancelText || generatedCancelText}
          </Button>
        ),
        <Button
          key="yes"
          className={`${style.yesButton} ${!danger ? style.btnNotDanger : ""}`}
          onClick={onConfirm}
          type="primary"
          danger={danger}
        >
          {confirmText || generatedConfirmText}
        </Button>,
      ]}
    >
      <div className={style.modal}>
        <Icons.warning className={style.icon} />
        <h3 className={style.confirmTitle}>{title || generatedTitle}</h3>
        <p className={style.confirmDesc}>{description || generatedDescription}</p>
        {errorMessages && errorMessages.length > 0 ? (
          <div className={style.errorList}>
            <ul>
              {errorMessages.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className={style.confirmDesc}>{description || generatedDescription}</p>
        )}
      </div>
    </Modal>
  );
};

export default ConfirmModal;
