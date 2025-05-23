import { Modal, Divider, Button, Flex } from "antd";
import style from "./ModalForm.module.scss";
import { CustomButton } from "@/components";
import { Icons } from "@/assets";

type ModalFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onCancel?: () => void;
  onSave: () => void;
  isLoading?: boolean;
  title: React.ReactNode;
  children: React.ReactNode;
  isUpdate?: boolean;
  cancelLabel?: string;
  saveLabel?: string;
  size?: "normal" | "normalXL" | "normalXXL" | "large" | "largeXL";
  noCancel?: boolean;
  noDivider?: boolean;
  onDelete?: () => void;
};

const ModalForm = ({
  isOpen,
  onClose,
  onCancel,
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
  onDelete,
}: ModalFormProps) => {
  return (
    <Modal
      className={`${style.modalContainer} ${style[size]}`}
      open={isOpen}
      onCancel={onClose}
      footer={[
        ...(noDivider ? [] : [<Divider className={style.dividerModal} key="divider" />]),
        ...(!noCancel
          ? [
              <CustomButton
                key="cancel"
                label={cancelLabel}
                isCancel
                handleOnClick={onCancel ?? onClose}
              />,
            ]
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
        <Flex justify="start" gap={20}>
          {typeof title === "string" ? <h2 className={style.titleModal}>{title}</h2> : title}
          {onDelete && (
            <Button danger type="primary" onClick={onDelete}>
              <Icons.delete />
            </Button>
          )}
        </Flex>

        {!noDivider && <Divider className={style.dividerModal} />}
      </div>
      {children}
    </Modal>
  );
};

export default ModalForm;
