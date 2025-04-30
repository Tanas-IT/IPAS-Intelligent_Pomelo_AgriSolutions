import style from "./FarmInfo.module.scss";
import { Divider, Empty, Flex, Image } from "antd";
import { Icons } from "@/assets";
import { ConfirmModal, CustomButton, LoadingSkeleton, Section, SectionHeader } from "@/components";
import { useEffect, useState } from "react";
import { FarmDocumentRequest, GetFarmDocuments } from "@/payloads";
import { getFarmId } from "@/utils";
import { toast } from "react-toastify";
import { farmService } from "@/services";
import { useModal } from "@/hooks";
import DocumentModal from "./DocumentModal/DocumentModal";

function LegalDocument() {
  const [isLoading, setIsLoading] = useState(true);
  const [legalDocuments, setLegalDocuments] = useState<GetFarmDocuments[]>([]);
  const formModal = useModal<GetFarmDocuments>();
  const deleteConfirmModal = useModal<{ docId: string }>();
  const updateConfirmModal = useModal<{ doc: FarmDocumentRequest }>();

  const fetchFarmDocumentsData = async () => {
    try {
      setIsLoading(true);
      const result = await farmService.getFarmDocuments(getFarmId());

      if (result.statusCode === 200) {
        setLegalDocuments(result.data ?? []);
      }
    } catch (error) {
      console.error("Fetch data error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmDocumentsData();
  }, []);

  const handleDelete = async () => {
    const docId = deleteConfirmModal.modalState.data?.docId;
    if (!docId) return;
    try {
      setIsLoading(true);
      var result = await farmService.deleteFarmDocuments(docId);
      if (result.statusCode === 200) {
        toast.success(result.message);
        await fetchFarmDocumentsData();
      } else {
        toast.warning(result.message);
      }
    } finally {
      setIsLoading(false);
      deleteConfirmModal.hideModal();
    }
  };

  const handleUpdateConfirm = (doc: FarmDocumentRequest) => {
    const oldDoc = legalDocuments.find((d) => d.legalDocumentId === doc.LegalDocumentId);
    if (!oldDoc) return;

    // Lấy danh sách resourceID từ oldDoc và doc
    const oldResourceIds = oldDoc.resources.map((r) => r.resourceID);
    const newResourceIds = doc.resources.map((r) => r.resourceID);

    // Kiểm tra nếu có file mới được thêm
    const hasNewFile = doc.resources.some((r) => r.file);

    // Kiểm tra nếu resourceID cũ bị mất
    const hasRemovedResource = oldResourceIds.some((id) => !newResourceIds.includes(id));

    // So sánh dữ liệu
    const isChanged =
      oldDoc.legalDocumentType !== doc.legalDocumentType ||
      oldDoc.legalDocumentName !== doc.legalDocumentName ||
      hasNewFile || // Nếu có file mới
      hasRemovedResource; // Nếu có resource bị xóa

    if (isChanged) {
      updateConfirmModal.showModal({ doc });
    } else {
      formModal.hideModal();
    }
  };

  const handleUpdate = async () => {
    const doc = updateConfirmModal.modalState.data?.doc;
    if (!doc) return;
    try {
      setIsLoading(true);
      var result = await farmService.updateFarmDocuments(doc);
      if (result.statusCode === 200) {
        toast.success(result.message);
        await fetchFarmDocumentsData();
      } else {
        toast.warning(result.message);
      }
    } finally {
      setIsLoading(false);
      formModal.hideModal();
      updateConfirmModal.hideModal();
    }
  };

  const handleAdd = async (doc: FarmDocumentRequest) => {
    try {
      setIsLoading(true);
      var result = await farmService.createFarmDocuments(doc);
      if (result.statusCode === 200) {
        toast.success(result.message);
        await fetchFarmDocumentsData();
      } else {
        toast.warning(result.message);
      }
    } finally {
      setIsLoading(false);
      formModal.hideModal();
    }
  };

  if (isLoading) return <LoadingSkeleton rows={10} />;

  return (
    <Flex className={style.contentWrapper}>
      <Flex className={style.contentWrapperHeader}>
        <SectionHeader
          title="Legal Documents"
          subtitle="Upload and manage your farm’s legal documents"
          isDisplayEdit={false}
        />
        <CustomButton
          label="Add New Document"
          icon={<Icons.plus />}
          handleOnClick={() => formModal.showModal()}
        />
      </Flex>

      <Divider className={style.divider} />
      <Flex className={style.contentSectionBody}>
        {legalDocuments.length > 0 ? (
          legalDocuments.map((doc) => (
            <Section
              key={doc.legalDocumentCode}
              title={`${doc.legalDocumentName} - ${doc.legalDocumentType}`}
              subtitle={`Update your ${doc.legalDocumentName}.`}
            >
              <Flex className={style.formDocument}>
                <Flex className={style.imageWrapper}>
                  {doc.resources.length > 0 ? (
                    doc.resources.map((resource) => (
                      <Image
                        crossOrigin="anonymous"
                        key={resource.resourceID}
                        className={style.image}
                        src={resource.resourceURL}
                        alt={doc.legalDocumentName}
                      />
                    ))
                  ) : (
                    <div>No document uploaded</div>
                  )}
                </Flex>
                <Flex gap={14} className={style.actionBtnsWrapper}>
                  <Icons.delete
                    className={style.iconEdit}
                    onClick={() => deleteConfirmModal.showModal({ docId: doc.legalDocumentId })}
                  />
                  <Icons.edit className={style.iconEdit} onClick={() => formModal.showModal(doc)} />
                </Flex>
              </Flex>
            </Section>
          ))
        ) : (
          <Empty description="No document available" />
        )}
      </Flex>

      <DocumentModal
        isOpen={formModal.modalState.visible}
        onClose={formModal.hideModal}
        onSave={formModal.modalState.data ? handleUpdateConfirm : handleAdd}
        documentData={formModal.modalState.data}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={deleteConfirmModal.modalState.visible}
        onConfirm={handleDelete}
        onCancel={deleteConfirmModal.hideModal}
        title="Delete Document?"
        description="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
      />
      {/* Confirm Update Modal */}
      <ConfirmModal
        visible={updateConfirmModal.modalState.visible}
        onConfirm={handleUpdate}
        onCancel={updateConfirmModal.hideModal}
        title="Update Document?"
        description="Are you sure you want to update this document? This action cannot be undone."
        confirmText="Save Changes"
        cancelText="Cancel"
      />
    </Flex>
  );
}

export default LegalDocument;
