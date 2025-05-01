import { Flex, Form, Image, Upload, UploadFile, UploadProps } from "antd";
import { useState, useEffect } from "react";
import { FormFieldModal, ModalForm, SectionWrapper } from "@/components";
import style from "./DocumentModal.module.scss";
import { getBase64, RulesManager } from "@/utils";
import { Icons } from "@/assets";
import { toast } from "react-toastify";
import { farmDocumentFormFields, MASTER_TYPE, MESSAGES } from "@/constants";
import { FarmDocumentRequest, GetFarmDocuments, GetMasterType } from "@/payloads";
import { FileType } from "@/types";
import { useMasterTypeOptions, useStyle } from "@/hooks";

type DocumentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: FarmDocumentRequest) => void;
  documentData?: GetFarmDocuments;
};

const DocumentModal = ({ isOpen, onClose, onSave, documentData }: DocumentModalProps) => {
  const { styles } = useStyle();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const isEdit = documentData !== undefined && Object.keys(documentData).length > 0;
  const { options: documentTypeOptions } = useMasterTypeOptions(MASTER_TYPE.DOCUMENT, true);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleFileChange: UploadProps["onChange"] = ({ fileList }) => {
    setFileList(fileList); // Cập nhật danh sách file vào state
    form.setFieldsValue({ documents: fileList.length > 0 ? fileList : undefined });
  };

  useEffect(() => {
    if (isOpen) {
      form.resetFields();
      if (isEdit && documentData) {
        const formattedFiles: UploadFile[] = documentData.resources.map((resource) => ({
          uid: resource.resourceID,
          name: resource.resourceCode,
          status: "done",
          url: resource.resourceURL,
          crossOrigin: "anonymous",
        }));
        form.setFieldsValue({
          documentId: documentData.legalDocumentId,
          documentName: documentData.legalDocumentName,
          documentType: documentData.legalDocumentType,
          documents: formattedFiles,
        });

        setFileList(formattedFiles);
      } else {
        setFileList([]);
      }
    }
  }, [isOpen, documentData]);

  const handleOk = async () => {
    await form.validateFields();
    const documentData: FarmDocumentRequest = {
      LegalDocumentId: form.getFieldValue(farmDocumentFormFields.documentId),
      legalDocumentType: form.getFieldValue(farmDocumentFormFields.documentType),
      legalDocumentName: form.getFieldValue(farmDocumentFormFields.documentName),
      resources: (form.getFieldValue(farmDocumentFormFields.documents) || []).map(
        (file: UploadFile) => ({
          resourceID: file.uid,
          file: file.originFileObj,
        }),
      ),
    };
    onSave(documentData);
  };

  const handleCancel = () => {
    setFileList([]); // Reset file list
    form.resetFields();
    onClose();
  };

  const handleBeforeUpload = (file: FileType) => {
    const isImage = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"].includes(
      file.type,
    );

    if (!isImage) {
      toast.warning(MESSAGES.IMAGE_INVALID);
    }

    return isImage ? false : Upload.LIST_IGNORE;
  };

  const uploadButton = (
    <button className={style.btnUpload} type="button">
      <Icons.plus />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={handleCancel}
      onSave={handleOk}
      isUpdate={isEdit}
      title={isEdit ? "Update Document" : "Add New Document"} // Thay đổi tiêu đề theo mode
    >
      <Form form={form} layout="vertical" className={style.modalContainer}>
        <FormFieldModal
          label="Document Name:"
          name={farmDocumentFormFields.documentName}
          rules={RulesManager.getDocumentRules()}
          placeholder="Enter the document name"
        />

        <FormFieldModal
          type="select"
          label="Document Type:"
          name={farmDocumentFormFields.documentType}
          rules={RulesManager.getDocumentTypeRules()}
          options={documentTypeOptions}
        />

        <SectionWrapper
          title="Resources:"
          name={farmDocumentFormFields.documents}
          valuePropName="fileList"
          description="Only image files are supported (PNG, JPG, GIF, WEBP). You can upload up to 10 images."
          // rules={[{ required: true, message: "Please upload at least one document!" }]}
        >
          <Upload
            className={styles.customUpload}
            listType="picture-card"
            fileList={fileList}
            accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
            multiple={true}
            onPreview={handlePreview}
            onChange={handleFileChange}
            beforeUpload={handleBeforeUpload}
            maxCount={10}
          >
            {fileList.length >= 10 ? null : uploadButton}
          </Upload>
        </SectionWrapper>

        {previewImage && (
          <Image
            wrapperStyle={{ display: "none" }}
            preview={{
              visible: previewOpen,
              onVisibleChange: (visible) => setPreviewOpen(visible),
              afterOpenChange: (visible) => !visible && setPreviewImage(""),
            }}
            src={previewImage}
          />
        )}
      </Form>
    </ModalForm>
  );
};

export default DocumentModal;
