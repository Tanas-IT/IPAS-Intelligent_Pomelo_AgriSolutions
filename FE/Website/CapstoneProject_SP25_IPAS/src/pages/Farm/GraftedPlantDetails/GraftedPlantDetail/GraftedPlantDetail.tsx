import { useLocation, useNavigate } from "react-router-dom";
import style from "./GraftedPlantDetail.module.scss";
import { Divider, Flex } from "antd";
import { Icons } from "@/assets";
import {
  ConfirmModal,
  GraftedPlantModal,
  GraftedPlantSectionHeader,
  InfoFieldDetail,
  LoadingSkeleton,
} from "@/components";
import { useEffect, useState } from "react";
import { formatDayMonth } from "@/utils";
import { graftedPlantService } from "@/services";
import { GetGraftedPlantDetail, GraftedPlantRequest } from "@/payloads";
import { ROUTES } from "@/constants";
import { useGraftedPlantStore } from "@/stores";
import { useModal, useTableUpdate } from "@/hooks";
import { toast } from "react-toastify";
import { PATHS } from "@/routes";

function GraftedPlantDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathnames = location.pathname.split("/");
  const lotId = pathnames[pathnames.length - 2];
  const { graftedPlant, setGraftedPlant, shouldRefetch } = useGraftedPlantStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const formModal = useModal<GetGraftedPlantDetail>();
  const deleteConfirmModal = useModal<{ id: number }>();
  const updateConfirmModal = useModal<{ updatedGrafted: GraftedPlantRequest }>();
  const cancelConfirmModal = useModal();

  const fetchPlantLot = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500)); // ⏳ Delay 1 giây
    try {
      const res = await graftedPlantService.getGraftedPlant(Number(lotId));
      if (res.statusCode === 200) {
        setGraftedPlant(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlantLot();
  }, [lotId, shouldRefetch]);

  const handleDelete = async (id: number | undefined) => {
    const res = await graftedPlantService.deleteGraftedPlants([id] as number[]);
    const toastMessage = res.message;
    if (res.statusCode === 200) {
      deleteConfirmModal.hideModal();
      navigate(PATHS.FARM.GRAFTED_PLANT_LIST, { state: { toastMessage } });
    } else {
      toast.error(toastMessage);
    }
  };

  const hasChanges = (
    oldData: GetGraftedPlantDetail,
    newData: Partial<GraftedPlantRequest>,
  ): boolean => {
    if (!oldData || !newData) return false;

    const fieldsToCompare: (keyof GraftedPlantRequest)[] = [
      "graftedPlantId",
      "graftedPlantName",
      "separatedDate",
      "graftedDate",
      "status",
      "note",
      "plantLotId",
    ];

    return fieldsToCompare.some((key) => {
      if (newData[key] === undefined) return false; // Bỏ qua nếu newData[key] không được cập nhật

      if (key === "separatedDate" || key === "graftedDate") {
        // Lấy phần ngày (YYYY-MM-DD) của giá trị cũ và mới
        const oldDate = oldData[key]?.split("T")[0];
        const newDate = newData[key]?.split("T")[0];

        return oldDate !== newDate;
      }

      return newData[key] !== oldData[key as keyof GetGraftedPlantDetail];
    });
  };

  const handleUpdateConfirm = (updatedGrafted: GraftedPlantRequest) => {
    if (!graftedPlant) return;
    if (hasChanges(graftedPlant, updatedGrafted)) {
      updateConfirmModal.showModal({ updatedGrafted });
    } else {
      formModal.hideModal();
    }
  };

  const handleCancelConfirm = (updatedGrafted: GraftedPlantRequest) => {
    if (!graftedPlant) return;
    const hasUnsavedChanges = hasChanges(graftedPlant, updatedGrafted);

    if (hasUnsavedChanges) {
      cancelConfirmModal.showModal();
    } else {
      formModal.hideModal();
    }
  };

  const { handleUpdate, isUpdating } = useTableUpdate<GraftedPlantRequest>({
    updateService: graftedPlantService.updateGraftedPlant,
    fetchData: fetchPlantLot,
    onSuccess: () => {
      formModal.hideModal();
      updateConfirmModal.hideModal();
    },
    onError: () => {
      updateConfirmModal.hideModal();
    },
  });

  const infoFieldsLeft = [
    // { label: "Partner", value: lot?.partnerName, icon: Icons.category },
    // { label: "Seeding Name", value: lot?.seedingName, icon: Icons.plant },
    {
      label: "Separated Date",
      value: graftedPlant?.separatedDate ? formatDayMonth(graftedPlant.separatedDate) : "N/A",
      icon: Icons.time,
    },
    {
      label: "Grafted Date",
      value: graftedPlant?.graftedDate ? formatDayMonth(graftedPlant.graftedDate) : "N/A",
      icon: Icons.time,
    },
    { label: "Note", value: graftedPlant?.note ?? "N/A", icon: Icons.description },
  ];

  const infoFieldsRight = [
    { label: "Cultivar", value: graftedPlant?.cultivarId, icon: Icons.scale },
    //   { label: "Initial Quantity", value: graftedPlant?.previousQuantity, icon: Icons.box },
    //   {
    //     label: "Checked  Quantity",
    //     value: graftedPlant?.inputQuantity ?? "Checking...",
    //     icon: Icons.checkSuccuss,
    //   },
    //   {
    //     label: "Qualified Quantity",
    //     value: graftedPlant?.lastQuantity ?? "Checking...",
    //     icon: Icons.star,
    //   },
    //   { label: "Assigned Quantity", value: graftedPlant?.usedQuantity ?? 0, icon: Icons.share },
  ];

  if (isLoading) return <LoadingSkeleton rows={10} />;

  return (
    <Flex className={style.contentDetailWrapper}>
      <GraftedPlantSectionHeader formModal={formModal} deleteConfirmModal={deleteConfirmModal} />
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

      <GraftedPlantModal
        isOpen={formModal.modalState.visible}
        onClose={handleCancelConfirm}
        onSave={formModal.modalState.data ? handleUpdateConfirm : () => {}}
        isLoadingAction={formModal.modalState.data ? isUpdating : false}
        graftedPlantData={formModal.modalState.data}
      />
      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={deleteConfirmModal.modalState.visible}
        onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.id)}
        onCancel={deleteConfirmModal.hideModal}
        itemName="Plant Lot"
        actionType="delete"
      />
      {/* Confirm Update Modal */}
      <ConfirmModal
        visible={updateConfirmModal.modalState.visible}
        onConfirm={() => handleUpdate(updateConfirmModal.modalState.data?.updatedGrafted)}
        onCancel={updateConfirmModal.hideModal}
        itemName="Plant Lot"
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

export default GraftedPlantDetail;
