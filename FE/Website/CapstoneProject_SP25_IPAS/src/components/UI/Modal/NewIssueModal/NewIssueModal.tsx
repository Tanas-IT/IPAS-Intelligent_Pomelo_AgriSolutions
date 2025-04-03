import { Flex, Form, Image, Upload, UploadFile, UploadProps } from "antd";
import { useState, useEffect } from "react";
import { FormFieldModal, ModalForm, SectionWrapper } from "@/components";
import style from "./NewIssueModal.module.scss";
import { getBase64, RulesManager } from "@/utils";
import { Icons } from "@/assets";
import { toast } from "react-toastify";
import { MESSAGES, plantGrowthHistoryFormFields } from "@/constants";
import { PlantGrowthHistoryRequest } from "@/payloads";
import { FileType } from "@/types";
import { useStyle } from "@/hooks";
import { useDirtyStore, usePlantStore } from "@/stores";

type NewIssueModalProps<T extends { [key: string]: any }> = {
  data: T;
  idKey: keyof T;
  id: number;
  isOpen: boolean;
  onClose: (values: T) => void;
  onSave: (values: T) => void;
  isLoading: boolean;
};

const NewIssueModal = <T extends { [key: string]: any }>({
  data,
  idKey,
  id,
  isOpen,
  onClose,
  onSave,
  isLoading,
}: NewIssueModalProps<T>) => {
  const { styles } = useStyle();
  const { setIsDirty } = useDirtyStore();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewVideo, setPreviewVideo] = useState("");

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    if (file.type?.startsWith("video/")) {
      setPreviewVideo(file.url || (file.preview as string));
      setPreviewImage("");
    } else {
      setPreviewImage(file.url || (file.preview as string));
      setPreviewVideo("");
    }

    setPreviewOpen(true);
  };

  const handleFileChange: UploadProps["onChange"] = ({ fileList }) => {
    setFileList(fileList);
    form.setFieldsValue({ plantResources: fileList.length > 0 ? fileList : undefined });
    if (fileList.length > 0) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      form.resetFields();
    }
  }, [isOpen]);

  const getFormData = (): T => {
    return {
      [idKey]: id,
      issueName: form.getFieldValue(plantGrowthHistoryFormFields.issueName),
      content: form.getFieldValue(plantGrowthHistoryFormFields.content),
      resources: fileList
        .map((file) => file.originFileObj as File | undefined)
        .filter((file): file is File => Boolean(file)), // Loại bỏ undefined
    } as unknown as T;
  };

  const handleOk = async () => {
    await form.validateFields();
    // console.log(getFormData());
    onSave(getFormData());
  };

  const handleCancel = () => onClose(getFormData());

  const handleBeforeUpload = (file: FileType) => {
    const isMedia = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/ogg",
    ].includes(file.type);

    if (!isMedia) {
      toast.error(MESSAGES.IMAGE_OR_VIDEO_INVALID);
    }

    return isMedia ? false : Upload.LIST_IGNORE;
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
      isLoading={isLoading}
      title={"Add New Issue"}
      size="large"
    >
      <Form form={form} layout="vertical" className={style.modalContainer}>
        <Flex gap={20}>
          <FormFieldModal
            label="Issue Name:"
            name={plantGrowthHistoryFormFields.issueName}
            rules={RulesManager.getRequiredRules("Issue Name")}
          />
        </Flex>

        <FormFieldModal
          type="textarea"
          label="Content:"
          name={plantGrowthHistoryFormFields.content}
          rules={RulesManager.getRequiredRules("Content")}
        />

        <SectionWrapper
          title="Resources:"
          name={"plantResources"}
          valuePropName="fileList"
          description="Supported formats: Images (PNG, JPG, GIF, WEBP) & Videos (MP4, WEBM, OGG). You can upload up to 10 files."
        >
          <Upload
            className={styles.customUpload}
            listType="picture-card"
            fileList={fileList}
            accept="image/png, image/jpeg, image/jpg, image/gif, image/webp, video/mp4, video/webm, video/ogg"
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

        {previewVideo && (
          <video controls style={{ width: "100%" }}>
            <source src={previewVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </Form>
    </ModalForm>
  );
};

export default NewIssueModal;
