import { Modal, Divider } from "antd";
import style from "./ModalForm.module.scss";
import CustomButton from "../Button/CustomButton";

type ModalFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  isLoading?: boolean;
  title: string;
  children: React.ReactNode;
  isUpdate?: boolean;
  cancelLabel?: string;
  saveLabel?: string;
  size?: "normal" | "large" | "largeXL";
  noCancel?: boolean;
  noDivider?: boolean;
};

const ModalForm = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
  title,
  children,
  isUpdate = false,
  cancelLabel = "Cancel",
  saveLabel,
  size = "normal",
  noCancel = false,
  noDivider = false,
}: ModalFormProps) => {
  return (
    <Modal
      className={`${style.modalContainer} ${style[size]}`}
      open={isOpen}
      onCancel={onClose}
      footer={[
        ...(noDivider ? [] : [<Divider className={style.dividerModal} key="divider" />]),
        ...(!noCancel
          ? [<CustomButton key="cancel" label={cancelLabel} isCancel handleOnClick={onClose} />]
          : []),
        <CustomButton
          label={saveLabel ?? (isUpdate ? "Save Changes" : "Add New")}
          handleOnClick={onSave}
          isModal={true}
          isLoading={isLoading}
        />,
      ]}
    >
      <div>
        <h2 className={style.titleModal}>{title}</h2>
        {!noDivider && <Divider className={style.dividerModal} />}
      </div>
      {children}
    </Modal>
  );
};

export default ModalForm;
