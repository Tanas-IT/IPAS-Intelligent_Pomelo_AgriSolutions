import React from "react";
import { Modal, Button } from "antd";
import style from "./ConfirmModal.module.scss";
import { Icons } from "@/assets";

interface ConfirmModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  onConfirm,
  onCancel,
  title = "Are you sure?",
  description = "This action cannot be undone. Please confirm if you want to proceed.",
  confirmText = "Yes",
  cancelText = "No",
  isDanger = false,
}) => {
  return (
    <Modal
      visible={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      className={style.modalContainer}
      footer={[
        <Button key="no" className={style.noButton} onClick={onCancel}>
          {cancelText}
        </Button>,
        <Button
          key="yes"
          className={`${style.yesButton} ${!isDanger ? style.btnNotDanger : ""}`}
          onClick={onConfirm}
          type="primary"
          danger={isDanger}
        >
          {confirmText}
        </Button>,
      ]}
    >
      <div className={style.modal}>
        <Icons.warning className={style.icon} />
        <h3 className={style.confirmTitle}>{title}</h3>
        <p className={style.confirmDesc}>{description}</p>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
