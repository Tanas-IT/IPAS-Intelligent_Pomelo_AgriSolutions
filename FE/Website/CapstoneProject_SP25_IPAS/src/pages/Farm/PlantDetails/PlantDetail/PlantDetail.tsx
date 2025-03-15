import { useLocation, useNavigate } from "react-router-dom";
import style from "./PlantDetail.module.scss";
import { Divider, Flex } from "antd";
import { Icons } from "@/assets";
import { ConfirmModal, InfoFieldDetail, LoadingSkeleton } from "@/components";
import { useEffect, useState } from "react";
import { DEFAULT_PLANT, formatDayMonth, formatDayMonthAndTime } from "@/utils";
import { plantService } from "@/services";
import { GetPlantDetail, PlantRequest } from "@/payloads";
import { useModal, useTableUpdate } from "@/hooks";
import PlantModel from "../../Plant/PlantModal";
import PlantSectionHeader from "./PlantSectionHeader";
import DescriptionSection from "./DescriptionSection";
import { PATHS } from "@/routes";
import { toast } from "react-toastify";
import PlantMarkAsDeadModal from "../../Plant/PlantMarkAsDeadModal";

function PlantDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathnames = location.pathname.split("/");
  const plantId = pathnames[pathnames.length - 2];
  const [plant, setPlant] = useState<GetPlantDetail>(DEFAULT_PLANT);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const formModal = useModal<GetPlantDetail>();
  const markAsDeadModal = useModal<{ id: number }>();
  const deleteConfirmModal = useModal<{ id: number }>();
  const updateConfirmModal = useModal<{ updatedPlant: PlantRequest }>();
  const markAsDeadConfirmModal = useModal<{ id: number }>();
  const cancelConfirmModal = useModal();

  const fetchPlant = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // ⏳ Delay 1 giây
    try {
      const res = await plantService.getPlant(Number(plantId));
      if (res.statusCode === 200) {
        setPlant(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlant();
  }, []);

  const handleDelete = async (id: number | undefined) => {
    const res = await plantService.deletePlant([id] as number[]);
    const toastMessage = res.message;
    if (res.statusCode === 200) {
      deleteConfirmModal.hideModal();
      navigate(PATHS.FARM.FARM_PLANT_LIST, { state: { toastMessage } });
    } else {
      toast.error(toastMessage);
    }
  };

  const hasChanges = (oldData: GetPlantDetail, newData: Partial<PlantRequest>): boolean => {
    if (!oldData || !newData) return false;

    const fieldsToCompare: (keyof PlantRequest)[] = [
      "healthStatus",
      "plantReferenceId",
      "description",
      "masterTypeId",
      "plantingDate",
    ];

    return fieldsToCompare.some((key) => {
      if (newData[key] === undefined) return false; // Bỏ qua nếu newData[key] không được cập nhật

      if (key === "plantingDate") {
        // So sánh chỉ theo ngày (YYYY-MM-DD)
        const oldDate = oldData.plantingDate?.split("T")[0]; // Lấy phần "YYYY-MM-DD"
        const newDate = newData.plantingDate?.split("T")[0];

        return oldDate !== newDate;
      }

      return newData[key] !== oldData[key as keyof GetPlantDetail];
    });
  };

  const handleUpdateConfirm = (updatedPlant: PlantRequest) => {
    if (hasChanges(plant, updatedPlant)) {
      updateConfirmModal.showModal({ updatedPlant });
    } else {
      formModal.hideModal();
    }
  };

  const handleCancelConfirm = (updatedPlant: PlantRequest) => {
    const hasUnsavedChanges = hasChanges(plant, updatedPlant);

    if (hasUnsavedChanges) {
      cancelConfirmModal.showModal();
    } else {
      formModal.hideModal();
    }
  };

  const { handleUpdate, isUpdating } = useTableUpdate<PlantRequest>({
    updateService: plantService.updatePlant,
    fetchData: fetchPlant,
    onSuccess: () => {
      formModal.hideModal();
      updateConfirmModal.hideModal();
    },
    onError: () => {
      updateConfirmModal.hideModal();
    },
  });

  const handleMarkAsDead = async (plantId?: number) => {
    if (!plantId) return;
    try {
      markAsDeadConfirmModal.hideModal();
      setIsLoading(true);
      var res = await plantService.updatePlantDead(plantId);
      if (res.statusCode === 200) {
        toast.success(res.message);
        markAsDeadModal.hideModal();
        await fetchPlant();
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const infoFieldsLeft = [
    { label: "Growth Status", value: plant.growthStageName, icon: Icons.growth },
    { label: "Plant Lot", value: "Green Pomelo Lot 1", icon: Icons.box },
    { label: "Mother Plant", value: plant.plantReferenceCode ?? "N/A", icon: Icons.plant },
    { label: "Create Date", value: formatDayMonthAndTime(plant.createDate), icon: Icons.time },
  ];

  const infoFieldsRight = [
    {
      label: "Plant Location",
      value:
        plant.landPlotName && plant.rowIndex !== undefined && plant.plantIndex !== undefined
          ? `${plant.landPlotName} - Row ${plant.rowIndex} - Plant #${plant.plantIndex}`
          : "Not Assigned",
      icon: Icons.location,
    },
    {
      label: "Cultivar",
      value: `${plant.masterTypeName} - ${plant.characteristic}`,
      icon: Icons.plant,
    },
    { label: "Planting Date", value: formatDayMonth(plant.plantingDate), icon: Icons.time },
  ];

  const description = plant.description ?? "N/A";

  if (isLoading) return <LoadingSkeleton rows={10} />;

  return (
    <Flex className={style.contentDetailWrapper}>
      <PlantSectionHeader
        plant={plant}
        formModal={formModal}
        deleteConfirmModal={deleteConfirmModal}
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
      <DescriptionSection description={description} id={plant.plantId} code={plant.plantCode} />
      <PlantModel
        isOpen={formModal.modalState.visible}
        onClose={handleCancelConfirm}
        onSave={handleUpdateConfirm}
        isLoadingAction={isUpdating}
        plantData={formModal.modalState.data}
      />
      <PlantMarkAsDeadModal
        isOpen={markAsDeadModal.modalState.visible}
        onClose={markAsDeadModal.hideModal}
        onSave={markAsDeadConfirmModal.showModal}
        isLoadingAction={isLoading}
      />
      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={deleteConfirmModal.modalState.visible}
        onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.id)}
        onCancel={deleteConfirmModal.hideModal}
        itemName="Plant"
        actionType="delete"
      />
      {/* Confirm Update Modal */}
      <ConfirmModal
        visible={updateConfirmModal.modalState.visible}
        onConfirm={() => handleUpdate(updateConfirmModal.modalState.data?.updatedPlant)}
        onCancel={updateConfirmModal.hideModal}
        itemName="Plant"
        actionType="update"
      />
      {/* Confirm Mark as Dead Modal */}
      <ConfirmModal
        visible={markAsDeadConfirmModal.modalState.visible}
        onConfirm={() => handleMarkAsDead(markAsDeadModal.modalState.data?.id)}
        onCancel={markAsDeadConfirmModal.hideModal}
        confirmText="Mark as Dead"
        title="Mark Plant as Dead?"
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

export default PlantDetail;
