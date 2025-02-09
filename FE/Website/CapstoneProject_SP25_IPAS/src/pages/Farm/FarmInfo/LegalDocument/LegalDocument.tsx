import style from "../FarmInfo.module.scss";
import { Button, Divider, Flex, GetProp, Image, Upload, UploadFile, UploadProps } from "antd";
import { Icons, Images } from "@/assets";
import { CustomButton, EditActions, Section, SectionHeader } from "@/components";
import { useState } from "react";
import { GetFarmDocuments } from "@/payloads";
import { defaultFarmDocuments } from "@/utils";
import { toast } from "react-toastify";
import AddDocumentModal from "./AddDocumentModal";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

function LegalDocument() {
  const [legalDocuments, setLegalDocuments] = useState<GetFarmDocuments>(defaultFarmDocuments);
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const documentFields = [
    { key: "landOwnershipCertificate", label: "Land Ownership Certificate" },
    { key: "operatingLicense", label: "Operating License" },
    { key: "landLeaseAgreement", label: "Land Lease Agreement" },
    { key: "pesticideUseLicense", label: "Pesticide Use License" },
  ] as const;

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleFileChange =
    (fieldKey: keyof GetFarmDocuments) =>
    ({ file, fileList }: { file: UploadFile; fileList: UploadFile[] }) => {
      console.log(file);

      if (!file?.type?.startsWith("image/") && file.status === "uploading") {
        toast.error("Only image files (JPG, PNG, GIF, WEBP) are allowed!");
        return Upload.LIST_IGNORE;
      }

      // Nếu file chưa được upload, tạo một URL tạm thời từ file
      if (file.status === "uploading") {
        file.preview = file.originFileObj && URL.createObjectURL(file.originFileObj);
      }

      setLegalDocuments((prev) => ({
        ...prev,
        [`${fieldKey}`]: [...(prev[fieldKey] || []), file.originFileObj],
        [`${fieldKey}Urls`]: fileList.map((file) => file.url || file.preview || ""),
      }));
    };

  const handleEdit = (key: string) => {
    setIsEditing((prev) => ({ ...prev, [key]: true }));
  };

  const handleCancel = (key: string) => {
    setLegalDocuments(defaultFarmDocuments);
    setIsEditing((prev) => ({ ...prev, [key]: false }));
  };

  const handleSave = (key: string) => {
    // TODO: Xử lý logic lưu dữ liệu
    toast.success(`${key} updated successfully!`);
    setIsEditing((prev) => ({ ...prev, [key]: false }));
    console.log(legalDocuments);
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <Icons.plus />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <Flex className={style.contentWrapper}>
      <Flex className={style.contentWrapperHeader}>
        <SectionHeader
          title="Legal Documents"
          subtitle="Upload and manage your farm’s legal documents"
          isDisplayEdit={false}
        />
        <CustomButton label="Add New Document" icon={<Icons.plus />} handleOnClick={showModal} />
      </Flex>

      <Divider className={style.divider} />
      <Flex className={style.contentSectionBody}>
        {documentFields.map((field) => {
          const urls = legalDocuments[`${field.key}Urls`] || [];
          const editing = isEditing[field.key] || false;

          return (
            <Section key={field.key} title={field.label} subtitle={`Update your ${field.label}.`}>
              <Flex className={style.formDocument}>
                {editing ? (
                  <>
                    <Upload
                      listType="picture-card"
                      fileList={urls.map((url, index) => ({
                        uid: index.toString(),
                        name: `image-${index}`,
                        status: "done",
                        url,
                      }))}
                      accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                      multiple={true}
                      onPreview={handlePreview}
                      onChange={handleFileChange(field.key)}
                    >
                      {urls.length >= 10 ? null : uploadButton}
                    </Upload>
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
                  </>
                ) : urls.length > 0 ? (
                  <Flex className={style.imageWrapper}>
                    {urls.map((url, index) => (
                      <Image key={index} className={style.image} src={url} alt={field.label} />
                    ))}
                  </Flex>
                ) : (
                  <div>No document uploaded</div>
                )}
                {editing ? (
                  <EditActions
                    handleCancel={() => handleCancel(field.key)}
                    handleSave={() => handleSave(field.key)}
                  />
                ) : (
                  <Icons.edit className={style.iconEdit} onClick={() => handleEdit(field.key)} />
                )}
              </Flex>
            </Section>
          );
        })}
      </Flex>
      <AddDocumentModal isOpen={isModalOpen} onClose={handleClose} onSave={handleSave} />
    </Flex>
  );
}

export default LegalDocument;
