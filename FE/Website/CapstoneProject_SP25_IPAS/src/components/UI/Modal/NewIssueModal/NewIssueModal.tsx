import { Flex, Form, Image, Modal, Upload, UploadFile, UploadProps } from "antd";
import { useState, useEffect } from "react";
import { FormFieldModal, ModalForm, SectionWrapper } from "@/components";
import style from "./NewIssueModal.module.scss";
import { getBase64, RulesManager } from "@/utils";
import { Icons } from "@/assets";
import { toast } from "react-toastify";
import { FILE_FORMAT, MESSAGES, plantGrowthHistoryFormFields } from "@/constants";
import { FileResource, FileType } from "@/types";
import { useStyle } from "@/hooks";
import { useDirtyStore } from "@/stores";

type BaseIssueType = {
  issueName: string;
  content: string;
  resources: FileResource[];
};

type NewIssueModalProps<T extends { [key: string]: any }> = {
  data?: T;
  idKey: keyof T;
  id: number;
  isOpen: boolean;
  onClose: (values: T, isUpdate: boolean) => void;
  onSave: (values: T) => void;
  isLoading: boolean;
};

const NewIssueModal = <T extends BaseIssueType>({
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
  const [imageList, setImageList] = useState<UploadFile[]>([]);
  const [videoList, setVideoList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewVideo, setPreviewVideo] = useState("");
  const isUpdate = Boolean(data);

  const resetForm = () => {
    setImageList([]);
    setVideoList([]);
    setPreviewImage("");
    setPreviewVideo("");
    setIsDirty(false);
    form.resetFields();
  };

  useEffect(() => {
    resetForm();
    if (isOpen && data) {
      console.log(data);
      form.setFieldsValue({
        [plantGrowthHistoryFormFields.issueName]: data.issueName,
        [plantGrowthHistoryFormFields.content]: data.content,
      });
      const imageResources =
        data.resources?.filter((r) => r.fileFormat === FILE_FORMAT.IMAGE) || [];
      const videoResources =
        data.resources?.filter((r) => r.fileFormat === FILE_FORMAT.VIDEO) || [];
      const convertToUploadFile = (r: FileResource): UploadFile => ({
        uid: r.resourceID.toString(),
        name: r.resourceCode || r.fileFormat || "file",
        status: "done",
        url: r.resourceURL,
        type: r.fileFormat.startsWith("image") ? "image/" + r.fileFormat : "video/" + r.fileFormat,
        crossOrigin: "anonymous",
      });

      setImageList(imageResources.map(convertToUploadFile));
      setVideoList(videoResources.map(convertToUploadFile));
    }
  }, [isOpen, data]);

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

  const updateFormResources = (images: UploadFile[], videos: UploadFile[]) => {
    const combined = [...images, ...videos];
    setIsDirty(combined.length > 0);
    form.setFieldsValue({ plantResources: combined.length > 0 ? combined : undefined });
  };

  const handleImageChange: UploadProps["onChange"] = ({ fileList }) => {
    setImageList(fileList);
    updateFormResources(fileList, videoList);
  };

  const handleVideoChange: UploadProps["onChange"] = ({ fileList }) => {
    setVideoList(fileList);
    updateFormResources(imageList, fileList);
  };

  const getFormData = (): T => {
    const existingResources = [...imageList, ...videoList].map((file) => {
      // File mới (chưa có ID)
      if (!file.uid || isNaN(Number(file.uid))) {
        return file.originFileObj as File;
      }

      // File cũ giữ nguyên (đã có ID)
      return {
        resourceID: Number(file.uid),
      };
    });
    return {
      [idKey]: id,
      issueName: form.getFieldValue(plantGrowthHistoryFormFields.issueName),
      content: form.getFieldValue(plantGrowthHistoryFormFields.content),
      resources: existingResources,
    } as unknown as T;
  };

  const handleOk = async () => {
    await form.validateFields();
    // console.log(getFormData());
    onSave(getFormData());
  };

  const handleCancel = () => onClose(getFormData(), isUpdate);

  const beforeUploadImage = (file: FileType) => {
    const isImage = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"].includes(
      file.type,
    );
    if (!isImage) toast.warning(MESSAGES.IMAGE_INVALID);
    return isImage ? false : Upload.LIST_IGNORE;
  };

  const beforeUploadVideo = (file: FileType) => {
    const isVideo = ["video/mp4", "video/webm", "video/ogg"].includes(file.type);
    if (!isVideo) toast.warning(MESSAGES.IMAGE_INVALID);
    return isVideo ? false : Upload.LIST_IGNORE;
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
      isUpdate={isUpdate}
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
          title="Image Upload"
          name="imageResources"
          description="Upload up to 5 images (PNG, JPG, GIF, WEBP)."
        >
          <Upload
            className={styles.customUpload}
            listType="picture-card"
            fileList={imageList}
            accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
            multiple
            onPreview={handlePreview}
            onChange={handleImageChange}
            beforeUpload={beforeUploadImage}
            maxCount={5}
          >
            {imageList.length >= 5 ? null : uploadButton}
          </Upload>
        </SectionWrapper>

        <SectionWrapper
          title="Video Upload"
          name="videoResources"
          description="Upload up to 5 videos (MP4, WEBM, OGG)."
        >
          <Upload
            className={styles.customUpload}
            listType="picture-card"
            fileList={videoList}
            accept="video/mp4, video/webm, video/ogg"
            multiple
            onPreview={handlePreview}
            onChange={handleVideoChange}
            beforeUpload={beforeUploadVideo}
            maxCount={5}
            itemRender={(originNode, file, fileList, actions) => {
              return (
                <div className={style.videoWrapper}>
                  <video
                    src={file.url || (file.preview as string)}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div className={style.previewOverlay}>
                    <Icons.eye onClick={() => handlePreview(file)} />
                    <Icons.delete onClick={() => actions.remove?.()} />
                  </div>
                </div>
              );
            }}
          >
            {videoList.length >= 5 ? null : uploadButton}
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
            crossOrigin="anonymous"
          />
        )}

        <Modal
          open={previewOpen && !!previewVideo}
          footer={null}
          onCancel={() => {
            setPreviewOpen(false);
            setPreviewVideo("");
          }}
          width={800}
        >
          <video key={previewVideo} controls className={style.videoPreview} crossOrigin="anonymous">
            <source src={previewVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Modal>
      </Form>
    </ModalForm>
  );
};

export default NewIssueModal;
