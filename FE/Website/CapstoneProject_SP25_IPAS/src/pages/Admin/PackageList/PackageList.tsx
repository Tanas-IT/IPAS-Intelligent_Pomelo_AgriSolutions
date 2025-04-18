import { Col, Flex, Row } from "antd";
import style from "./PackageList.module.scss";
import {
  ActionMenuPackage,
  ConfirmModal,
  CustomButton,
  Loading,
  PricingCard,
  SectionTitle,
} from "@/components";
import { useEffect, useState } from "react";
import { packageService } from "@/services";
import { GetPackage, PackageRequest } from "@/payloads/package";
import { Icons } from "@/assets";
import { useHasChanges, useModal, useTableAdd, useTableUpdate } from "@/hooks";
import PackageModal from "./PackageModal";
import { useDirtyStore } from "@/stores";
import { toast } from "react-toastify";

function PackageList() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [packages, setPackages] = useState<GetPackage[]>();
  const formModal = useModal<GetPackage>();
  const updateConfirmModal = useModal<{ pkg: PackageRequest }>();
  const deleteConfirmModal = useModal<{ id: number }>();
  const cancelConfirmModal = useModal();
  const { isDirty } = useDirtyStore();

  const fetchPackage = async () => {
    if (isLoading) await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const res = await packageService.getPackage();
      if (res.statusCode === 200 && res.data) {
        setPackages(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackage();
  }, []);

  const hasChanges = useHasChanges<PackageRequest>(packages ?? []);

  const handleUpdateConfirm = (pkg: PackageRequest) => {
    if (hasChanges(pkg, "packageId") || isDirty) {
      updateConfirmModal.showModal({ pkg });
    } else {
      formModal.hideModal();
    }
  };

  const handleCancelConfirm = (pkg: PackageRequest, isUpdate: boolean) => {
    const hasUnsavedChanges = isUpdate
      ? hasChanges(pkg, "packageId")
      : hasChanges(pkg, undefined, { isActive: false });

    if (hasUnsavedChanges || isDirty) {
      cancelConfirmModal.showModal();
    } else {
      formModal.hideModal();
    }
  };

  const { handleUpdate, isUpdating } = useTableUpdate<PackageRequest>({
    updateService: packageService.updatePackage,
    fetchData: fetchPackage,
    onSuccess: () => {
      formModal.hideModal();
      updateConfirmModal.hideModal();
    },
    onError: () => {
      updateConfirmModal.hideModal();
    },
  });

  const { handleAdd, isAdding } = useTableAdd({
    addService: packageService.createPackage,
    fetchData: fetchPackage,
    onSuccess: () => formModal.hideModal(),
  });

  const handleDelete = async (id?: number) => {
    if (!id) return;

    var res = await packageService.deletePackage(id);
    if (res.statusCode === 200) {
      toast.success(res.message);
      deleteConfirmModal.hideModal();
      fetchPackage();
    }
  };

  if (isLoading) return <Loading />;
  return (
    <Flex className={style.container}>
      <Flex justify="space-between">
        <SectionTitle title="Package Management" />
        <CustomButton
          label={"Add new Package"}
          icon={<Icons.plus />}
          handleOnClick={() => formModal.showModal()}
        />
      </Flex>
      <Row gutter={[16, 16]}>
        {packages?.map((pkg) => (
          <Col key={pkg.packageId} xs={24} sm={12} md={8}>
            <PricingCard
              key={pkg.packageId}
              packageName={pkg.packageName}
              packagePrice={pkg.packagePrice}
              duration={pkg.duration}
              isActive={pkg.isActive}
              packageDetails={pkg.packageDetails}
              isAdmin={true}
              actionMenu={
                <ActionMenuPackage
                  onEdit={() => formModal.showModal(pkg)}
                  onDelete={() => deleteConfirmModal.showModal({ id: pkg.packageId })}
                />
              }
            />
          </Col>
        ))}
      </Row>
      <PackageModal
        isOpen={formModal.modalState.visible}
        onClose={handleCancelConfirm}
        onSave={formModal.modalState.data ? handleUpdateConfirm : handleAdd}
        isLoadingAction={formModal.modalState.data ? isUpdating : isAdding}
        pkgData={formModal.modalState.data}
      />
      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={deleteConfirmModal.modalState.visible}
        onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.id)}
        onCancel={deleteConfirmModal.hideModal}
        itemName="Package"
        actionType="delete"
      />
      {/* Confirm Update Modal */}
      <ConfirmModal
        visible={updateConfirmModal.modalState.visible}
        onConfirm={() => handleUpdate(updateConfirmModal.modalState.data?.pkg)}
        onCancel={updateConfirmModal.hideModal}
        itemName="Package"
        actionType="update"
      />
      {/* Confirm Cancel Modal */}
      <ConfirmModal
        visible={cancelConfirmModal.modalState.visible}
        actionType="unsaved"
        onConfirm={() => {
          cancelConfirmModal.hideModal();
          formModal.hideModal();
        }}
        onCancel={cancelConfirmModal.hideModal}
      />
    </Flex>
  );
}

export default PackageList;
