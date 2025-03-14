import { Flex, Form, Upload, UploadFile, UploadProps } from "antd";
import { useState } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { RulesManager } from "@/utils";
import { PlusOutlined } from "@ant-design/icons";
import { RcFile } from "antd/es/upload";

type NoteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: { note: string; issue: string; files: File[] }) => void;
  isLoadingAction?: boolean;
  initialValues?: { note?: string; issue?: string; files?: UploadFile[] };
};

const NoteModal = ({
  isOpen,
  onClose,
  onSave,
  isLoadingAction,
  initialValues,
}: NoteModalProps) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>(initialValues?.files || []);

  const handleUploadChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    form.setFieldsValue({ resources: fileList.length > 0 ? fileList : undefined });
  };

  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      console.error("You can only upload image or video files!");
    }
    return isImage || isVideo || Upload.LIST_IGNORE;
  };

  const handleOk = async () => {
    await form.validateFields();
    const values = form.getFieldsValue();
    const files = fileList.map((file) => file.originFileObj as File);
    onSave({ ...values, files });
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onClose();
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={handleCancel}
      onSave={handleOk}
      isLoading={isLoadingAction}
      title="Add Note"
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        {/* Note Field */}
        <FormFieldModal
          label="Note"
          name="note"
          rules={RulesManager.getRequiredRules("Note is required")}
          type="textarea"
          placeholder="Enter your note"
        />

        {/* Issue Field */}
        <FormFieldModal
          label="Issue"
          name="issue"
          rules={RulesManager.getRequiredRules("Issue is required")}
          type="textarea"
          placeholder="Describe the issue"
        />

        {/* File Upload (Images and Videos) */}
        <Form.Item
          label="Upload Files (Images or Videos)"
          name="resources"
          rules={RulesManager.getRequiredRules("At least one file is required")}
        >
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={beforeUpload}
            multiple
          >
            {fileList.length >= 8 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </Form.Item>
      </Form>
    </ModalForm>
  );
};

export default NoteModal;