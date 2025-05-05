import { useLocation, useNavigate } from "react-router-dom";
import style from "./CropDetail.module.scss";
import { Divider, Flex } from "antd";
import { Icons } from "@/assets";
import {
  ConfirmModal,
  CropModal,
  CropSectionHeader,
  InfoFieldDetail,
  LoadingSkeleton,
  SectionLong,
} from "@/components";
import { useEffect, useState } from "react";
import { formatDate, formatDayMonth } from "@/utils";
import { cropService } from "@/services";
import { CropRequest, GetCropDetail } from "@/payloads";
import { useModal, useTableUpdate } from "@/hooks";
import { toast } from "react-toastify";
import { PATHS } from "@/routes";
import { useCropStore } from "@/stores";

function CropDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathnames = location.pathname.split("/");
  const cropId = pathnames[pathnames.length - 2];
  const { crop, setCrop } = useCropStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const formModal = useModal<GetCropDetail>();
  const deleteConfirmModal = useModal<{ id: number }>();
  const updateConfirmModal = useModal<{ updatedCrop: CropRequest }>();
  const cancelConfirmModal = useModal();

  const fetchCrop = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500)); // ⏳ Delay 1 giây
    try {
      const res = await cropService.getCropOfFarm(Number(cropId));
      if (res.statusCode === 200) {
        setCrop(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCrop();
  }, [cropId]);

  const handleDelete = async (id: number | undefined) => {
    const res = await cropService.deleteCrop([id] as number[]);
    const toastMessage = res.message;
    if (res.statusCode === 200) {
      deleteConfirmModal.hideModal();
      navigate(PATHS.CROP.CROP_LIST, { state: { toastMessage } });
    } else {
      toast.warning(toastMessage);
    }
  };

  const hasChanges = (oldData: GetCropDetail, newData: Partial<CropRequest>): boolean => {
    if (!oldData || !newData) return false;

    const fieldsToCompare: (keyof CropRequest)[] = [
      "cropId",
      "cropName",
      "startDate",
      "endDate",
      "cropExpectedTime",
      "cropActualTime",
      "harvestSeason",
      "estimateYield",
      "actualYield",
      "notes",
      "marketPrice",
    ];

    const dateFields: (keyof CropRequest)[] = [
      "startDate",
      "endDate",
      "cropExpectedTime",
      "cropActualTime",
    ];

    return fieldsToCompare.some((key) => {
      if (newData[key] === undefined) return false; // Bỏ qua nếu newData[key] không được cập nhật
      if (dateFields.includes(key)) {
        // Kiểm tra kiểu dữ liệu trước khi gọi .split()
        const oldDate =
          typeof oldData[key] === "string" ? (oldData[key] as string).split("T")[0] : oldData[key];
        const newDate =
          typeof newData[key] === "string" ? (newData[key] as string).split("T")[0] : newData[key];

        return oldDate !== newDate;
      }

      return newData[key] !== oldData[key as keyof GetCropDetail];
    });
  };

  const handleUpdateConfirm = (updatedCrop: CropRequest) => {
    if (!crop) return;
    if (hasChanges(crop, updatedCrop)) {
      updateConfirmModal.showModal({ updatedCrop });
    } else {
      formModal.hideModal();
    }
  };

  const handleCancelConfirm = (updatedCrop: CropRequest) => {
    if (!crop) return;
    const hasUnsavedChanges = hasChanges(crop, updatedCrop);

    if (hasUnsavedChanges) {
      cancelConfirmModal.showModal();
    } else {
      formModal.hideModal();
    }
  };

  const { handleUpdate, isUpdating } = useTableUpdate<CropRequest>({
    updateService: cropService.updateCrop,
    fetchData: fetchCrop,
    onSuccess: () => {
      formModal.hideModal();
      updateConfirmModal.hideModal();
    },
    onError: () => {
      updateConfirmModal.hideModal();
    },
  });

  const infoFieldsLeft = [
    {
      label: "Create Date",
      value: crop?.createDate ? formatDayMonth(crop.createDate) : "N/A",
      icon: Icons.time,
    },
    { label: "Harvest Season", value: crop?.harvestSeason, icon: Icons.leaf },
    {
      label: "Crop Duration",
      value: crop?.startDate
        ? `${formatDate(crop.startDate)} - ${formatDate(crop.endDate)}`
        : "N/A",
      icon: Icons.calendar,
    },
    {
      label: "Market Price",
      value: crop?.marketPrice ? `${crop.marketPrice.toLocaleString()} VND/kg` : "N/A",
      icon: Icons.money,
    },
    {
      label: "Number of Harvests",
      value: crop?.numberHarvest ? crop.numberHarvest : "N/A",
      icon: Icons.hand,
    },
  ];

  const infoFieldsRight = [
    {
      label: "Crop Expected Time",
      value: crop?.cropExpectedTime ? formatDayMonth(crop?.cropExpectedTime) : "N/A",
      icon: Icons.clock,
    },
    {
      label: "Crop Actual Time",
      value: crop?.cropActualTime ? formatDayMonth(crop?.cropActualTime) : "N/A",
      icon: Icons.clock,
    },
    {
      label: "Estimated Yield",
      value: crop?.estimateYield ? `${crop.estimateYield} kg` : "N/A",
      icon: Icons.chart,
    },
    {
      label: "Actual Yield",
      value: crop?.actualYield ? `${crop.actualYield} kg` : "N/A",
      icon: Icons.chart,
    },
    {
      label: "Number of Plots",
      value: crop?.numberPlot ? crop.numberPlot : "N/A",
      icon: Icons.map,
    },
  ];

  const handleClick = (plotId: number) => {
    navigate(PATHS.FARM.FARM_ROW_LIST, {
      state: { plotId, viewMode: "simulate" },
    });
  };

  if (isLoading) return <LoadingSkeleton rows={10} />;

  return (
    <Flex className={style.contentDetailWrapper}>
      <CropSectionHeader formModal={formModal} deleteConfirmModal={deleteConfirmModal} />
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
      <SectionLong text={crop?.notes} />
      <Divider className={style.divider} />
      <Flex className={style.landPlotSection}>
        <h3>Land Plots</h3>
        <Flex className={style.landPlotList}>
          {crop?.landPlotCrops && crop?.landPlotCrops.length > 0 ? (
            crop.landPlotCrops.map((plot) => (
              <div
                key={plot.landPlotID}
                className={style.landPlotItem}
                onClick={() => handleClick(plot.landPlotID)}
              >
                <Icons.leaf className={style.landPlotIcon} />
                {plot.landPlotName}
              </div>
            ))
          ) : (
            <p>No land plots assigned</p>
          )}
        </Flex>
      </Flex>
      <CropModal
        isOpen={formModal.modalState.visible}
        onClose={handleCancelConfirm}
        onSave={handleUpdateConfirm}
        isLoadingAction={isUpdating}
        cropData={formModal.modalState.data}
      />
      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={deleteConfirmModal.modalState.visible}
        onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.id)}
        onCancel={deleteConfirmModal.hideModal}
        itemName="Crop"
        actionType="delete"
      />
      {/* Confirm Update Modal */}
      <ConfirmModal
        visible={updateConfirmModal.modalState.visible}
        onConfirm={() => handleUpdate(updateConfirmModal.modalState.data?.updatedCrop)}
        onCancel={updateConfirmModal.hideModal}
        itemName="Crop"
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

export default CropDetail;
