import { useLocation, useNavigate } from "react-router-dom";
import style from "./PlantLotDetail.module.scss";
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
import { plantLotService } from "@/services";
import { GetPlantLotDetail, PlantLotRequest } from "@/payloads";
import { LOT_TYPE, ROUTES } from "@/constants";
import { usePlantLotStore } from "@/stores";
import { useModal, useTableUpdate } from "@/hooks";
import { toast } from "react-toastify";
import { PATHS } from "@/routes";
import SectionLong from "./SectionLong";

function PlantLotDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathnames = location.pathname.split("/");
  const lotId = pathnames[pathnames.length - 2];
  const { lot, setLot, shouldRefetch } = usePlantLotStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const formModal = useModal<GetPlantLotDetail>();
  const deleteConfirmModal = useModal<{ id: number }>();
  const updateConfirmModal = useModal<{ updatedLot: PlantLotRequest }>();
  const cancelConfirmModal = useModal();

  const fetchPlantLot = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500)); // ⏳ Delay 1 giây
    try {
      const res = await plantLotService.getPlantLot(Number(lotId));
      if (res.statusCode === 200) {
        setLot(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlantLot();
  }, [lotId, shouldRefetch]);

  const handleDelete = async (id: number | undefined) => {
    const res = await plantLotService.deleteLots([id] as number[]);
    const toastMessage = res.message;
    if (res.statusCode === 200) {
      deleteConfirmModal.hideModal();
      navigate(PATHS.FARM.FARM_PLANT_LOT_LIST, { state: { toastMessage } });
    } else {
      toast.error(toastMessage);
    }
  };

  const hasChanges = (oldData: GetPlantLotDetail, newData: Partial<PlantLotRequest>): boolean => {
    if (!oldData || !newData) return false;

    const fieldsToCompare: (keyof PlantLotRequest)[] = [
      "plantLotName",
      "masterTypeId",
      "note",
      "unit",
      "partnerId",
      "isFromGrafted",
    ];

    return fieldsToCompare.some((key) => {
      if (newData[key] === undefined) return false; // Bỏ qua nếu newData[key] không được cập nhật

      return newData[key] !== oldData[key as keyof GetPlantLotDetail];
    });
  };

  const handleUpdateConfirm = (updatedLot: PlantLotRequest) => {
    if (!lot) return;
    if (hasChanges(lot, updatedLot)) {
      updateConfirmModal.showModal({ updatedLot });
    } else {
      formModal.hideModal();
    }
  };

  const handleCancelConfirm = (updatedLot: PlantLotRequest) => {
    if (!lot) return;
    const hasUnsavedChanges = hasChanges(lot, updatedLot);

    if (hasUnsavedChanges) {
      cancelConfirmModal.showModal();
    } else {
      formModal.hideModal();
    }
  };

  const { handleUpdate, isUpdating } = useTableUpdate<PlantLotRequest>({
    updateService: plantLotService.updateLot,
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
    {
      label: "Lot Type",
      value: lot?.isFromGrafted ? LOT_TYPE.GRAFTED_LOT : LOT_TYPE.IMPORTED_LOT,
      icon: Icons.category,
    },
    { label: "Partner", value: lot?.partnerName, icon: Icons.category },
    { label: "Seeding Name", value: lot?.seedingName, icon: Icons.plant },
    {
      label: "Imported Date",
      value: lot?.importedDate ? formatDayMonth(lot.importedDate) : "N/A",
      icon: Icons.time,
    },
    { label: "Note", value: lot?.note ?? "N/A", icon: Icons.description },
  ];

  const infoFieldsRight = [
    { label: "Unit", value: lot?.unit, icon: Icons.scale },
    { label: "Initial Quantity", value: lot?.previousQuantity, icon: Icons.box },
    {
      label: "Checked  Quantity",
      value: !lot?.inputQuantity ? "Checking..." : "",
      icon: Icons.checkSuccuss,
    },
    {
      label: "Qualified Quantity",
      value: !lot?.lastQuantity ? "Checking..." : "",
      icon: Icons.star,
    },
    { label: "Assigned Quantity", value: lot?.usedQuantity ?? 0, icon: Icons.share },
  ];

  const additionalLots = lot?.additionalPlantLots ?? [];

  if (isLoading) return <LoadingSkeleton rows={10} />;

  return (
    <Flex className={style.contentDetailWrapper}>
      <LotSectionHeader formModal={formModal} deleteConfirmModal={deleteConfirmModal} />
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
      {/* <SectionLong /> */}
      {/* Danh sách lô bổ sung */}
      {additionalLots.length > 0 && (
        <>
          <Divider className={style.divider} />
          <h3 className={style.sectionTitle}>Additional Plant Lots</h3>
          <div className={style.additionalTableWrapper}>
            <Table
              className={style.additionalTable}
              dataSource={additionalLots}
              rowKey="plantLotId"
              columns={[
                {
                  title: "Code",
                  dataIndex: "plantLotCode",
                  key: "plantLotCode",
                },
                {
                  title: "Lot Name",
                  dataIndex: "plantLotName",
                  key: "plantLotName",
                },
                {
                  title: "Unit",
                  dataIndex: "unit",
                  key: "unit",
                },
                {
                  title: "Initial Quantity",
                  dataIndex: "previousQuantity",
                  key: "previousQuantity",
                },
                {
                  title: "Checked Quantity",
                  dataIndex: "inputQuantity",
                  key: "inputQuantity",
                  render: (data) => data ?? "Checking...",
                },
                {
                  title: "Qualified Quantity",
                  dataIndex: "lastQuantity",
                  key: "lastQuantity",
                  render: (data) => data ?? "Checking...",
                },
                {
                  title: "Assigned Quantity",
                  dataIndex: "usedQuantity",
                  key: "usedQuantity",
                  render: (data) => data ?? "0",
                },
                {
                  title: "Imported Date",
                  dataIndex: "importedDate",
                  key: "importedDate",
                  render: (date) => (date ? formatDate(date) : "N/A"),
                },
                {
                  title: "Completed",
                  dataIndex: "isPassed",
                  key: "isPassed",
                  render: (date) => (
                    <Tag color={date.isPassed ? "green" : "red"}>
                      {date.isPassed ? "Completed" : "Not Completed"}
                    </Tag>
                  ),
                },
              ]}
              pagination={false}
              onRow={(record) => ({
                onClick: () =>
                  navigate(ROUTES.FARM_PLANT_LOT_ADDITIONAL(Number(lotId), record.plantLotId)),
                style: { cursor: "pointer" },
              })}
            />
          </div>
        </>
      )}
      <LotModal
        isOpen={formModal.modalState.visible}
        onClose={handleCancelConfirm}
        onSave={handleUpdateConfirm}
        isLoadingAction={isUpdating}
        lotData={formModal.modalState.data}
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
        onConfirm={() => handleUpdate(updateConfirmModal.modalState.data?.updatedLot)}
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

export default PlantLotDetail;
