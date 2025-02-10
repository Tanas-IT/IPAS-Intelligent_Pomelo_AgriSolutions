import style from "./FarmInfo.module.scss";
import { Divider, Empty, Flex, Image } from "antd";
import { Icons } from "@/assets";
import { ConfirmModal, CustomButton, LoadingSkeleton, Section, SectionHeader } from "@/components";
import { useEffect, useState } from "react";
import { CreateFarmDocumentRequest, GetFarmDocuments } from "@/payloads";
import { getFarmId } from "@/utils";
import { toast } from "react-toastify";
import { farmService } from "@/services";
import { useModal } from "@/hooks";
import DocumentModal from "./DocumentModal/DocumentModal";

function LegalDocument() {
  const [isLoading, setIsLoading] = useState(true);
  const [legalDocuments, setLegalDocuments] = useState<GetFarmDocuments[]>([]);
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const addModal = useModal<GetFarmDocuments>();
  const {
    modalState: deleteModal,
    showModal: showDeleteModal,
    hideModal: hideDeleteModal,
  } = useModal<{ docId: string }>();

  const fetchFarmDocumentsData = async () => {
    try {
      setIsLoading(true);
      const result = await farmService.getFarmDocuments(getFarmId());
      if (result.statusCode === 200) {
        setLegalDocuments(result.data);
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
    if (!deleteModal.data?.docId) return;
    try {
      setIsLoading(true);
      var result = await farmService.deleteFarmDocuments(deleteModal.data.docId);
      if (result.statusCode === 200) {
        toast.success(result.message);
        await fetchFarmDocumentsData();
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsLoading(false);
      hideDeleteModal();
    }
  };

  const handleEdit = (doc: GetFarmDocuments) => {
    console.log(doc);
  };

  const handleAdd = async (doc: CreateFarmDocumentRequest) => {
    try {
      setIsLoading(true);
      var result = await farmService.createFarmDocuments(doc);
      if (result.statusCode === 200) {
        toast.success(result.message);
        await fetchFarmDocumentsData();
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsLoading(false);
      addModal.hideModal();
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
          handleOnClick={() => addModal.showModal()}
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
                <Flex gap={14}>
                  <Icons.delete
                    className={style.iconEdit}
                    onClick={() => showDeleteModal({ docId: doc.legalDocumentId })}
                  />
                  <Icons.edit className={style.iconEdit} onClick={() => addModal.showModal(doc)} />
                </Flex>
              </Flex>
            </Section>
          ))
        ) : (
          <Empty description="No document available" />
        )}
      </Flex>

      <DocumentModal
        isOpen={addModal.modalState.visible}
        onClose={addModal.hideModal}
        onSave={addModal.modalState.data ? handleEdit : handleAdd}
        documentData={addModal.modalState.data}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={deleteModal.visible}
        onConfirm={handleDelete}
        onCancel={hideDeleteModal}
        title="Delete Document?"
        description="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
      />
    </Flex>
  );
}

export default LegalDocument;
