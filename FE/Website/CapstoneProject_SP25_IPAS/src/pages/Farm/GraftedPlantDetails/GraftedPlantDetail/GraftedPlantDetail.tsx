import { useLocation, useNavigate } from "react-router-dom";
import style from "./GraftedPlantDetail.module.scss";
import { Divider, Flex, QRCode } from "antd";
import { Icons } from "@/assets";
import {
  ConfirmModal,
  CustomButton,
  CuttingGraftedModal,
  GraftedPlantModal,
  GraftedPlantSectionHeader,
  InfoFieldDetail,
  LoadingSkeleton,
  PlantMarkAsDeadModal,
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
  const markAsDeadModal = useModal<{ id: number }>();
  const markAsDeadConfirmModal = useModal<{ id: number }>();
  const addToLotModal = useModal<{ id: number }>();
  const removeLotConfirmModal = useModal<{ id: number }>();
  const updateConfirmModal = useModal<{ updatedGrafted: GraftedPlantRequest }>();
  const cancelConfirmModal = useModal();

  function doDownload(url: string, fileName: string) {
    const a = document.createElement("a");
    a.download = fileName;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Giải phóng bộ nhớ
  }

  const downloadSvgQRCode = () => {
    const svg = document.getElementById("myqrcode")?.querySelector<SVGElement>("svg");
    const svgData = new XMLSerializer().serializeToString(svg!);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    doDownload(url, `QRCode-${graftedPlant?.graftedPlantCode}.svg`);
  };
  const baseUrl = import.meta.env.VITE_APP_BASE_URL;

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

  const handleMarkAsDead = async (id?: number) => {
    if (!id) return;

    markAsDeadConfirmModal.hideModal();
    var res = await graftedPlantService.updateGraftedPlantDead(id);
    if (res.statusCode === 200) {
      toast.success(res.message);
      markAsDeadModal.hideModal();
      await fetchPlantLot();
    } else {
      toast.error(res.message);
    }
  };

  const onAddToLot = async (lotId: number, graftedPlantId?: number) => {
    if (!graftedPlantId) return;
    var res = await graftedPlantService.groupGraftedPlant([graftedPlantId], lotId);

    if (res.statusCode === 200) {
      addToLotModal.hideModal();
      toast.success(res.message);
      await fetchPlantLot();
    } else {
      toast.error(res.message);
    }
  };

  const removeFromLot = async (id?: number) => {
    if (!id) return;
    var res = await graftedPlantService.unGroupGraftedPlant([id]);

    if (res.statusCode === 200) {
      removeLotConfirmModal.hideModal();
      toast.success(res.message);
      await fetchPlantLot();
    } else {
      toast.error(res.message);
    }
  };

  const infoFieldsLeft = [
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
    { label: "Cultivar", value: graftedPlant?.cultivarName, icon: Icons.plant },
    { label: "Mother Plant", value: graftedPlant?.plantName, icon: Icons.plant },
    { label: "Destination Lot", value: graftedPlant?.plantLotName, icon: Icons.box },
  ];

  if (isLoading) return <LoadingSkeleton rows={10} />;

  return (
    <Flex className={style.contentDetailWrapper}>
      <GraftedPlantSectionHeader
        formModal={formModal}
        deleteConfirmModal={deleteConfirmModal}
        onAddToLot={addToLotModal}
        removeFromLotConfirm={removeLotConfirmModal}
        markAsDeadModal={markAsDeadModal}
      />
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
      <Flex vertical gap={10} justify="center">
        <QRCode
          id="myqrcode"
          type="svg"
          value={`${baseUrl}/farm/grafted-plants/${graftedPlant?.graftedPlantId}/details`}
          size={180}
        />
        <CustomButton label="Download" handleOnClick={downloadSvgQRCode} />
      </Flex>

      <GraftedPlantModal
        isOpen={formModal.modalState.visible}
        onClose={handleCancelConfirm}
        onSave={formModal.modalState.data ? handleUpdateConfirm : () => {}}
        isLoadingAction={formModal.modalState.data ? isUpdating : false}
        graftedPlantData={formModal.modalState.data}
      />
      <CuttingGraftedModal
        isMove
        isOpen={addToLotModal.modalState.visible}
        onClose={addToLotModal.hideModal}
        onSave={(lotId) => onAddToLot(lotId, addToLotModal.modalState.data?.id)}
        isLoadingAction={isLoading}
      />
      <PlantMarkAsDeadModal
        isOpen={markAsDeadModal.modalState.visible}
        onClose={markAsDeadModal.hideModal}
        onSave={markAsDeadConfirmModal.showModal}
        isLoadingAction={isLoading}
        entityType="GraftedPlant"
      />
      {/* Confirm Mark as Dead Modal */}
      <ConfirmModal
        visible={markAsDeadConfirmModal.modalState.visible}
        onConfirm={() => handleMarkAsDead(markAsDeadModal.modalState.data?.id)}
        onCancel={markAsDeadConfirmModal.hideModal}
        confirmText="Mark as Dead"
        title="Mark Grafted Plan as Dead?"
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
      {/* Confirm remove from lot Modal */}
      <ConfirmModal
        visible={removeLotConfirmModal.modalState.visible}
        onConfirm={() => removeFromLot(removeLotConfirmModal.modalState.data?.id)}
        onCancel={removeLotConfirmModal.hideModal}
        title="Remove Grafted Plant from Lot"
        description="Are you sure you want to remove this grafted plant from the lot? This action will not delete the plant but will unassign it from the current lot."
        confirmText="Remove"
        cancelText="Cancel"
        isDanger={true}
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
