import { useLocation, useNavigate } from "react-router-dom";
import style from "./ProductDetail.module.scss";
import { Collapse, Divider, Empty, Flex, Table, Tag } from "antd";
import { Icons } from "@/assets";
import {
  ApplyProductCriteriaModal,
  ConfirmModal,
  CriteriaProductTable,
  InfoFieldDetail,
  LoadingSkeleton,
  MasterTypesModal,
  ProductSectionHeader,
} from "@/components";
import { useEffect, useState } from "react";
import { formatDayMonth } from "@/utils";
import { CRITERIA_TARGETS } from "@/constants";
import { useModal, useStyle, useTableUpdate } from "@/hooks";
import { toast } from "react-toastify";
import { PATHS } from "@/routes";
import { GetMasterTypeDetail, MasterTypeRequest } from "@/payloads";
import { masterTypeService, productService } from "@/services";
import { useDirtyStore } from "@/stores";

function ProductDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathnames = location.pathname.split("/");
  const productId = pathnames[pathnames.length - 2];
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [product, setProduct] = useState<GetMasterTypeDetail>();
  const formModal = useModal<GetMasterTypeDetail>();
  const criteriaModal = useModal<{ id: number }>();
  const deleteConfirmModal = useModal<{ id: number }>();
  const deleteCriteriaConfirmModal = useModal<{ productId: number; criteriaSetId: number }>();
  const updateConfirmModal = useModal<{ updatedReq: MasterTypeRequest }>();
  const cancelConfirmModal = useModal();
  const { isDirty } = useDirtyStore();
  const { styles } = useStyle();

  const fetchProduct = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500)); // ⏳ Delay 1 giây
    try {
      const res = await productService.getProduct(Number(productId));
      if (res.statusCode === 200) setProduct(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const handleDelete = async (id: number | undefined) => {
    const res = await masterTypeService.deleteMasterTypes([id] as number[]);
    const toastMessage = res.message;
    if (res.statusCode === 200) {
      deleteConfirmModal.hideModal();
      navigate(PATHS.CLASSIFICATION.PRODUCT, { state: { toastMessage } });
    } else {
      toast.warning(toastMessage);
    }
  };

  const hasChanges = (
    oldData: GetMasterTypeDetail,
    newData: Partial<MasterTypeRequest>,
  ): boolean => {
    if (!oldData || !newData) return false;

    const fieldsToCompare: (keyof MasterTypeRequest)[] = [
      "masterTypeId",
      "masterTypeDescription",
      "isActive",
    ];

    return fieldsToCompare.some((key) => {
      if (newData[key] === undefined) return false; // Bỏ qua nếu newData[key] không được cập nhật

      return newData[key] !== oldData[key as keyof GetMasterTypeDetail];
    });
  };

  const handleUpdateConfirm = (updatedReq: MasterTypeRequest) => {
    if (!product) return;
    if (hasChanges(product, updatedReq)) {
      updateConfirmModal.showModal({ updatedReq });
    } else {
      formModal.hideModal();
    }
  };

  const handleCancelConfirm = (updatedReq: MasterTypeRequest) => {
    if (!product) return;
    const hasUnsavedChanges = hasChanges(product, updatedReq);

    if (hasUnsavedChanges) {
      cancelConfirmModal.showModal();
    } else {
      formModal.hideModal();
    }
  };

  const { handleUpdate, isUpdating } = useTableUpdate<MasterTypeRequest>({
    updateService: masterTypeService.updateMasterType,
    fetchData: fetchProduct,
    onSuccess: () => {
      formModal.hideModal();
      updateConfirmModal.hideModal();
    },
    onError: () => {
      updateConfirmModal.hideModal();
    },
  });

  const handleDeleteCriteriaConfirm = (productId: number, criteriaSetId: number) =>
    deleteCriteriaConfirmModal.showModal({ productId, criteriaSetId });

  const handleDeleteCriteria = async (productId?: number, criteriaSetId?: number) => {
    if (!productId || !criteriaSetId) return;

    const res = await productService.deleteProductCriteria(productId, criteriaSetId);
    if (res.statusCode === 200) {
      toast.success(res.message);
      deleteCriteriaConfirmModal.hideModal();
      await fetchProduct();
    } else {
      toast.warning(res.message);
    }
  };

  const handleCloseCriteria = () => {
    if (isDirty) {
      cancelConfirmModal.showModal();
    } else {
      criteriaModal.hideModal();
    }
  };

  const applyCriteria = async (productId: number, criteriaSetId: number) => {
    var res = await productService.applyProductCriteria(productId, criteriaSetId);
    try {
      setIsLoading(true);
      if (res.statusCode === 200) {
        criteriaModal.hideModal();
        toast.success(res.message);
        await fetchProduct();
      } else {
        toast.warning(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const infoFieldsLeft = [
    {
      label: "Create Date",
      value: product?.createDate ? formatDayMonth(product.createDate) : "N/A",
      icon: Icons.time,
    },
    {
      label: "Description",
      value: product?.masterTypeDescription ?? "N/A",
      icon: Icons.description,
    },
  ];

  if (isLoading) return <LoadingSkeleton rows={10} />;

  return (
    <Flex className={style.contentDetailWrapper}>
      <ProductSectionHeader
        product={product}
        formModal={formModal}
        deleteConfirmModal={deleteConfirmModal}
        criteriaModal={criteriaModal}
      />
      <Divider className={style.divider} />
      <Flex className={style.contentSectionBody} vertical>
        <Flex className={style.col}>
          {infoFieldsLeft.map((field, index) => (
            <InfoFieldDetail
              key={index}
              icon={field.icon}
              label={field.label}
              value={field.value}
            />
          ))}
        </Flex>
        {product?.type_Types && product.type_Types.length > 0 ? (
          <div className={style.collapseWrapper}>
            <div className={style.collapseTitle}>
              <h3>Criteria</h3>
            </div>
            <Collapse
              className={`${styles.customCollapse} ${style.criteriaCollapse}`}
              defaultActiveKey={product?.type_Types.map((group) =>
                group.criteriaSet.masterTypeId.toString(),
              )}
              ghost
            >
              {product?.type_Types.map((group) => {
                return (
                  <Collapse.Panel
                    header={
                      <Flex gap={20} align="center">
                        <span>{group.criteriaSet.masterTypeName}</span>
                        <span
                          className={style.deleteIcon}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCriteriaConfirm(
                              group.productId,
                              group.criteriaSet.masterTypeId,
                            );
                          }}
                        >
                          <Icons.delete className={style.iconDelete} /> {/* Thêm icon xoá */}
                        </span>
                      </Flex>
                    }
                    key={group.criteriaSet.masterTypeId}
                  >
                    <CriteriaProductTable data={group.criteriaSet.criterias} />
                  </Collapse.Panel>
                );
              })}
            </Collapse>
          </div>
        ) : (
          <Flex justify="center" align="center" style={{ width: "100%" }}>
            <Empty description="No criteria available" />
          </Flex>
        )}
      </Flex>

      <MasterTypesModal
        isProduct={true}
        isOpen={formModal.modalState.visible}
        onClose={handleCancelConfirm}
        onSave={handleUpdateConfirm}
        isLoadingAction={isUpdating}
        masterTypeData={formModal.modalState.data}
        typeCurrent={CRITERIA_TARGETS.Product}
      />
      <ApplyProductCriteriaModal
        productId={criteriaModal.modalState.data?.id}
        isOpen={criteriaModal.modalState.visible}
        onClose={handleCloseCriteria}
        onSave={applyCriteria}
        isLoadingAction={isLoading}
      />
      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={deleteConfirmModal.modalState.visible}
        onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.id)}
        onCancel={deleteConfirmModal.hideModal}
        itemName="Product"
        actionType="delete"
      />
      {/* Confirm Delete Criteria Modal */}
      <ConfirmModal
        visible={deleteCriteriaConfirmModal.modalState.visible}
        onConfirm={() =>
          handleDeleteCriteria(
            deleteCriteriaConfirmModal.modalState.data?.productId,
            deleteCriteriaConfirmModal.modalState.data?.criteriaSetId,
          )
        }
        onCancel={deleteCriteriaConfirmModal.hideModal}
        itemName="Criteria"
        actionType="delete"
      />
      {/* Confirm Update Modal */}
      <ConfirmModal
        visible={updateConfirmModal.modalState.visible}
        onConfirm={() => handleUpdate(updateConfirmModal.modalState.data?.updatedReq)}
        onCancel={updateConfirmModal.hideModal}
        itemName="Product"
        actionType="update"
      />
      {/* Confirm Cancel Modal */}
      <ConfirmModal
        visible={cancelConfirmModal.modalState.visible}
        actionType="unsaved"
        onConfirm={() => {
          cancelConfirmModal.hideModal();
          formModal.hideModal();
          criteriaModal.hideModal();
        }}
        onCancel={cancelConfirmModal.hideModal}
      />
    </Flex>
  );
}

export default ProductDetail;
