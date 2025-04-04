import { useLocation, useNavigate } from "react-router-dom";
import style from "./ProductDetail.module.scss";
import { Divider, Flex, Table, Tag } from "antd";
import { Icons } from "@/assets";
import {
  ConfirmModal,
  InfoFieldDetail,
  LoadingSkeleton,
  LotModal,
  LotSectionHeader,
} from "@/components";
import { useEffect, useState } from "react";
import { formatDate, formatDayMonth } from "@/utils";
import { LOT_TYPE, ROUTES } from "@/constants";
import { usePlantLotStore } from "@/stores";
import { useModal, useTableUpdate } from "@/hooks";
import { toast } from "react-toastify";
import { PATHS } from "@/routes";
import { GetMasterType } from "@/payloads";

function ProductDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathnames = location.pathname.split("/");
  const productId = pathnames[pathnames.length - 2];
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [product, setProduct] = useState();
  const formModal = useModal<GetMasterType>();
  // const deleteConfirmModal = useModal<{ id: number }>();
  // const updateConfirmModal = useModal<{ updatedLot: PlantLotRequest }>();
  // const cancelConfirmModal = useModal();

  // const fetchPlantLot = async () => {
  //   await new Promise((resolve) => setTimeout(resolve, 500)); // ⏳ Delay 1 giây
  //   try {
  //     const res = await plantLotService.getPlantLot(Number(lotId));
  //     if (res.statusCode === 200) {
  //       setLot(res.data);
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchPlantLot();
  // }, [lotId, shouldRefetch]);

  // const handleDelete = async (id: number | undefined) => {
  //   const res = await plantLotService.deleteLots([id] as number[]);
  //   const toastMessage = res.message;
  //   if (res.statusCode === 200) {
  //     deleteConfirmModal.hideModal();
  //     navigate(PATHS.FARM.FARM_PLANT_LOT_LIST, { state: { toastMessage } });
  //   } else {
  //     toast.error(toastMessage);
  //   }
  // };

  // const hasChanges = (oldData: GetProductDetail, newData: Partial<PlantLotRequest>): boolean => {
  //   if (!oldData || !newData) return false;

  //   const fieldsToCompare: (keyof PlantLotRequest)[] = [
  //     "plantLotName",
  //     "masterTypeId",
  //     "note",
  //     "unit",
  //     "partnerId",
  //     "isFromGrafted",
  //   ];

  //   return fieldsToCompare.some((key) => {
  //     if (newData[key] === undefined) return false; // Bỏ qua nếu newData[key] không được cập nhật

  //     return newData[key] !== oldData[key as keyof GetProductDetail];
  //   });
  // };

  // const handleUpdateConfirm = (updatedLot: PlantLotRequest) => {
  //   if (!lot) return;
  //   if (hasChanges(lot, updatedLot)) {
  //     updateConfirmModal.showModal({ updatedLot });
  //   } else {
  //     formModal.hideModal();
  //   }
  // };

  // const handleCancelConfirm = (updatedLot: PlantLotRequest) => {
  //   if (!lot) return;
  //   const hasUnsavedChanges = hasChanges(lot, updatedLot);

  //   if (hasUnsavedChanges) {
  //     cancelConfirmModal.showModal();
  //   } else {
  //     formModal.hideModal();
  //   }
  // };

  // const { handleUpdate, isUpdating } = useTableUpdate<PlantLotRequest>({
  //   updateService: plantLotService.updateLot,
  //   fetchData: fetchPlantLot,
  //   onSuccess: () => {
  //     formModal.hideModal();
  //     updateConfirmModal.hideModal();
  //   },
  //   onError: () => {
  //     updateConfirmModal.hideModal();
  //   },
  // });

  const infoFieldsLeft = [{ label: "Partner", value: lot?.partnerName, icon: Icons.category }];

  const infoFieldsRight = [{ label: "Unit", value: lot?.unit, icon: Icons.scale }];

  if (isLoading) return <LoadingSkeleton rows={10} />;

  return (
    <Flex className={style.contentDetailWrapper}>
      {/* <LotSectionHeader formModal={formModal} deleteConfirmModal={deleteConfirmModal} /> */}
      <Divider className={style.divider} />
      <Flex className={style.contentSectionBody}>
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
        <Flex className={style.col}>
          {infoFieldsRight.map((field, index) => (
            <InfoFieldDetail
              key={index}
              icon={field.icon}
              label={field.label}
              value={field.value}
            />
          ))}
        </Flex>
      </Flex>

      {/* <LotModal
        isOpen={formModal.modalState.visible}
        onClose={handleCancelConfirm}
        onSave={handleUpdateConfirm}
        isLoadingAction={isUpdating}
        lotData={formModal.modalState.data}
      /> */}
      {/* Confirm Delete Modal */}
      {/* <ConfirmModal
        visible={deleteConfirmModal.modalState.visible}
        onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.id)}
        onCancel={deleteConfirmModal.hideModal}
        itemName="Plant Lot"
        actionType="delete"
      /> */}
      {/* Confirm Update Modal */}
      {/* <ConfirmModal
        visible={updateConfirmModal.modalState.visible}
        onConfirm={() => handleUpdate(updateConfirmModal.modalState.data?.updatedLot)}
        onCancel={updateConfirmModal.hideModal}
        itemName="Plant Lot"
        actionType="update"
      /> */}
      {/* Confirm Cancel Modal */}
      {/* <ConfirmModal
        visible={cancelConfirmModal.modalState.visible}
        actionType="unsaved"
        onConfirm={() => {
          cancelConfirmModal.hideModal();
          formModal.hideModal();
        }}
        onCancel={cancelConfirmModal.hideModal}
      /> */}
    </Flex>
  );
}

export default ProductDetail;
