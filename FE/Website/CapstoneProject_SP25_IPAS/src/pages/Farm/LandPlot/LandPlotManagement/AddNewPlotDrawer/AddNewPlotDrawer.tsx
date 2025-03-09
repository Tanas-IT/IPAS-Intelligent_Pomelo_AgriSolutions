import { Drawer, Steps, Flex, Form } from "antd";
import { useEffect, useState } from "react";
import {
  GetLandPlot,
  landRowSimulate,
  LandPlotUpdateRequest,
  LandPlotUpdateCoordinationRequest,
} from "@/payloads";
import { ConfirmModal, EditActions } from "@/components";
import { DraggableRow, LandPlotCreate, RowConfiguration } from "@/pages";
import style from "./AddNewPlotDrawer.module.scss";
import { useModal, useStyle } from "@/hooks";
import { useLoadingStore, useMapStore } from "@/stores";
import { toast } from "react-toastify";
import { fakeRowsData } from "../DraggableRow/fakeRowsData";
import { createPlotFormFields, MESSAGES, POLYGON_DIMENSION_LIMITS } from "@/constants";
import { LandPlotRequest } from "@/payloads/landplot/requests";
import { DEFAULT_LAND_PLOT, isPlantOverflowing } from "@/utils";
import { landPlotService } from "@/services";
import { PolygonInit } from "@/types";

const { Step } = Steps;

interface AddNewPlotDrawerProps {
  selectedPlot?: GetLandPlot | null;
  landPlots: GetLandPlot[];
  fetchLandPlots: () => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

const AddNewPlotDrawer: React.FC<AddNewPlotDrawerProps> = ({
  selectedPlot,
  landPlots,
  fetchLandPlots,
  isOpen,
  onClose,
}) => {
  const { styles } = useStyle();
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  // const [isDirty, setIsDirty] = useState(false);
  const updateConfirmModal = useModal();
  const [plotData, setPlotData] = useState<LandPlotRequest>(DEFAULT_LAND_PLOT); // Lưu dữ liệu từ bước 1
  const [rowsData, setRowsData] = useState<landRowSimulate[]>(fakeRowsData);
  const {
    isDirty,
    setIsDirty,
    isPolygonDirty,
    setIsPolygonDirty,
    clearPolygons,
    isOverlapping,
    currentPolygon,
    setCurrentPolygon,
    setPolygonDimensions,
    setPolygonReady,
    width,
    length,
  } = useMapStore();
  const isHorizontal =
    form.getFieldValue(createPlotFormFields.rowOrientation) === "Horizontal" ? true : false;
  const { isLoading, setIsLoading } = useLoadingStore();
  const isUpdate = !!selectedPlot;

  const validatePolygonBeforeSave = () => {
    if (!currentPolygon) {
      toast.error(isUpdate ? MESSAGES.DRAW_PLOT_UPDATE : MESSAGES.DRAW_PLOT);
      return false;
    }
    if (isOverlapping) {
      toast.error(MESSAGES.OVERLAPPING_PLOT);
      return false;
    }
    const { minWidth, maxWidth, minLength, maxLength } = POLYGON_DIMENSION_LIMITS;

    if (width < minWidth || width > maxWidth) {
      toast.error(`Width must be between ${minWidth}m and ${maxWidth}m!`);
      return false;
    }

    // Kiểm tra length
    if (length < minLength || length > maxLength) {
      toast.error(`Length must be between ${minLength}m and ${maxLength}m!`);
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    setIsLoading(true);
    const plotDataRequest: LandPlotRequest = {
      ...plotData,
      numberOfRows: rowsData.length,
      minLength: 0,
      maxLength: 0,
      minWidth: 0,
      maxWidth: 0,
      landRows: rowsData.map((row) => ({
        rowIndex: row.rowIndex,
        treeAmount: row.treeAmount,
        distance: row.distance,
        length: row.length,
        width: row.width,
        direction: form.getFieldValue(createPlotFormFields.rowOrientation),
        description: form.getFieldValue(createPlotFormFields.description),
      })),
    };
    setPlotData(plotDataRequest);
    try {
      var result = await landPlotService.createLandPlot(plotDataRequest);

      if (result.statusCode === 200 || result.statusCode === 201) {
        resetForm();
        onClose();
        await fetchLandPlots();
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      await form.validateFields();
      if (!validatePolygonBeforeSave()) return;
      setPlotData((prev) => ({
        ...prev,
        landPlotName: form.getFieldValue(createPlotFormFields.landPlotName),
        area: form.getFieldValue(createPlotFormFields.area),
        plotLength: form.getFieldValue(createPlotFormFields.length),
        plotWidth: form.getFieldValue(createPlotFormFields.width),
        soilType: form.getFieldValue(createPlotFormFields.soilType),
        description: form.getFieldValue(createPlotFormFields.description),
        targetMarket: form.getFieldValue(createPlotFormFields.targetMarket),
        landPlotCoordinations: currentPolygon!.coordinates[0].map(([longitude, latitude]) => ({
          longitude,
          latitude,
        })),
      }));

      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === 1) {
      const values = await form.validateFields();
      const {
        [createPlotFormFields.rowLength]: rowLength,
        [createPlotFormFields.rowWidth]: rowWidth,
        [createPlotFormFields.numberOfRows]: numberOfRows,
        [createPlotFormFields.plantsPerRow]: treeAmount,
        [createPlotFormFields.plantSpacing]: distance,
        [createPlotFormFields.rowOrientation]: rowOrientation,
        [createPlotFormFields.lineSpacing]: lineSpacing,
        [createPlotFormFields.rowsPerLine]: rowsPerLine,
        [createPlotFormFields.rowSpacing]: rowSpacing,
      } = values;

      if (isPlantOverflowing(distance, treeAmount, rowLength)) {
        toast.error(MESSAGES.OUT_PLANT);
        return;
      }

      const generatedRows: landRowSimulate[] = Array.from({ length: numberOfRows }, (_, index) => ({
        landRowId: index + 1,
        landRowCode: "",
        length: rowLength,
        width: rowWidth,
        treeAmount,
        distance,
        rowIndex: index + 1,
        plants: [],
      }));

      setRowsData(generatedRows);
      const isHorizontal = rowOrientation === "Horizontal" ? true : false;
      setPlotData((prev) => ({
        ...prev,
        isRowHorizontal: isHorizontal,
        lineSpacing: lineSpacing,
        rowPerLine: rowsPerLine,
        rowSpacing: rowSpacing,
      }));

      setCurrentStep((prev) => prev + 1);
    } else {
      handleSave();
    }
  };

  const handlePrev = () => setCurrentStep((prev) => prev - 1);

  const handleSaveUpdate = async () => {
    await form.validateFields();
    if (!validatePolygonBeforeSave() || !selectedPlot || !currentPolygon) return;

    // Nếu không có thay đổi gì, reset và đóng modal luôn
    if (!isDirty && !isPolygonDirty) {
      resetForm();
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      // Chuẩn bị request cập nhật thông tin thửa
      const plotDataUpdateRequest: LandPlotUpdateRequest | null = isDirty
        ? {
            landPlotId: selectedPlot.landPlotId,
            landPlotName: form.getFieldValue(createPlotFormFields.landPlotName),
            area: form.getFieldValue(createPlotFormFields.area),
            length: form.getFieldValue(createPlotFormFields.length),
            width: form.getFieldValue(createPlotFormFields.width),
            soilType: form.getFieldValue(createPlotFormFields.soilType),
            targetMarket: form.getFieldValue(createPlotFormFields.targetMarket),
            description: form.getFieldValue(createPlotFormFields.description),
            status: form.getFieldValue(createPlotFormFields.status),
          }
        : null;

      // Chuẩn bị request cập nhật tọa độ polygon
      const plotCoordUpdateRequest: LandPlotUpdateCoordinationRequest | null = isPolygonDirty
        ? {
            landPlotId: selectedPlot.landPlotId,
            coordinationsUpdateModel: currentPolygon!.coordinates[0].map(
              ([longitude, latitude]) => ({
                longitude,
                latitude,
              }),
            ),
          }
        : null;

      // Gọi API song song nếu có thay đổi
      const [plotRes, coordRes] = await Promise.allSettled([
        plotDataUpdateRequest
          ? landPlotService.updateLandPlotInfo(plotDataUpdateRequest)
          : Promise.resolve(null),
        plotCoordUpdateRequest
          ? landPlotService.updateLandPlotCoordination(plotCoordUpdateRequest)
          : Promise.resolve(null),
      ]);

      // Kiểm tra kết quả API
      const isPlotUpdated = plotRes.status === "fulfilled" && plotRes.value?.statusCode === 200;
      const isCoordUpdated = coordRes.status === "fulfilled" && coordRes.value?.statusCode === 200;

      const plotError =
        plotRes.status === "fulfilled" && plotRes.value && plotRes.value.statusCode !== 200;
      const coordError =
        coordRes.status === "fulfilled" && coordRes.value && coordRes.value.statusCode !== 200;

      if (isPlotUpdated || isCoordUpdated) {
        toast.success(
          isPlotUpdated && isCoordUpdated
            ? MESSAGES.PLOT_AND_COORD_UPDATE_SUCCESS
            : isPlotUpdated
            ? MESSAGES.PLOT_UPDATE_SUCCESS
            : MESSAGES.COORD_UPDATE_SUCCESS,
        );
        resetForm();
        onClose();
        await fetchLandPlots();
      }

      if (plotError) toast.error(MESSAGES.PLOT_UPDATE_FAILED);
      if (coordError) toast.error(MESSAGES.COORD_UPDATE_FAILED);
    } catch (error) {
      toast.error("Failed to update plot. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    form.resetFields();
    setCurrentStep(0);
    setCurrentPolygon(null);
    setPolygonReady(false);
    setPolygonDimensions(0, 0, 0);
    setIsDirty(false);
    setIsPolygonDirty(false);
  };

  const confirmClose = () => {
    if (isDirty || (!isUpdate && currentPolygon) || isPolygonDirty) {
      updateConfirmModal.showModal();
    } else {
      resetForm();
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        window.dispatchEvent(new Event("resize")); // Trigger resize event
      }, 300); // Delay để chờ Drawer render xong
    }
  }, [isOpen]);

  return (
    <>
      <Drawer
        title={
          <Flex className={style.stepHeader}>
            {isUpdate ? (
              <Flex className={style.updateTitle}>
                <h3 className={style.editTitle}>Update Land Plot</h3>
              </Flex>
            ) : (
              <Steps
                current={currentStep}
                size="small"
                className={`${style.steps} ${styles.customSteps}`}
              >
                <Step title="Draw Plot" />
                <Step title="Set Up Rows" />
                <Step title="Confirm" />
              </Steps>
            )}

            <EditActions
              handleBtn1={currentStep === 0 ? confirmClose : handlePrev}
              handleBtn2={isUpdate ? handleSaveUpdate : handleNext}
              labelBtn1={currentStep === 0 ? "Cancel" : "Previous"}
              labelBtn2={isUpdate ? "Save Changes" : currentStep === 2 ? "Finish" : "Next"}
              isLoading={isLoading}
            />
          </Flex>
        }
        placement="right"
        onClose={confirmClose}
        open={isOpen}
        width="100%"
        height="100%"
      >
        {currentStep === 0 && (
          <LandPlotCreate
            isOpen={isOpen}
            selectedPlot={selectedPlot}
            landPlots={landPlots}
            form={form}
          />
        )}
        {currentStep === 1 && <RowConfiguration form={form} />}
        {currentStep === 2 && (
          <DraggableRow
            rowsData={rowsData}
            setRowsData={setRowsData}
            isHorizontal={isHorizontal}
            rowsPerLine={Number(form.getFieldValue(createPlotFormFields.rowsPerLine))}
            rowSpacing={Number(form.getFieldValue(createPlotFormFields.rowSpacing))}
            lineSpacing={Number(form.getFieldValue(createPlotFormFields.lineSpacing))}
            // isHorizontal={true}
            // rowsPerLine={5}
            // rowSpacing={50}
            // lineSpacing={50}
          />
        )}
      </Drawer>
      <ConfirmModal
        visible={updateConfirmModal.modalState.visible}
        actionType="unsaved"
        onConfirm={() => {
          updateConfirmModal.hideModal();
          resetForm();
          clearPolygons();
          onClose();
        }}
        onCancel={updateConfirmModal.hideModal}
      />
      ;
    </>
  );
};

export default AddNewPlotDrawer;
