import { Drawer, Steps, Flex, Form } from "antd";
import { useEffect, useState } from "react";
import { GetLandPlot } from "@/payloads";
import { ConfirmModal, EditActions } from "@/components";
import { DraggableRow, LandPlotCreate, RowConfiguration } from "@/pages";
import style from "./AddNewPlotDrawer.module.scss";
import { useModal, useStyle } from "@/hooks";
import { rowStateType } from "@/types";
import { useLoadingStore, useMapStore } from "@/stores";
import { toast } from "react-toastify";
import { fakeRowsData } from "../DraggableRow/fakeRowsData";
import { createPlotFormFields, MESSAGES } from "@/constants";
import { LandPlotRequest } from "@/payloads/landPlot/requests";
import { DEFAULT_LAND_PLOT, isPlantOverflowing } from "@/utils";
import { landPlotService } from "@/services";

const { Step } = Steps;

interface AddNewPlotDrawerProps {
  landPlots: GetLandPlot[];
  fetchLandPlots: () => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

const AddNewPlotDrawer: React.FC<AddNewPlotDrawerProps> = ({
  landPlots,
  fetchLandPlots,
  isOpen,
  onClose,
}) => {
  const { styles } = useStyle();
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [isDirty, setIsDirty] = useState(false);
  const updateConfirmModal = useModal();
  const [plotData, setPlotData] = useState<LandPlotRequest>(DEFAULT_LAND_PLOT); // Lưu dữ liệu từ bước 1
  const [rowsData, setRowsData] = useState<rowStateType[]>(fakeRowsData);
  const { clearPolygons, isOverlapping, newPolygon, setNewPolygon, setPolygonDimensions } =
    useMapStore();
  const isHorizontal =
    form.getFieldValue(createPlotFormFields.rowOrientation) === "Horizontal" ? true : false;
  const { isLoading, setIsLoading } = useLoadingStore();

  const handleSave = async () => {
    setIsLoading(true);
    const plotDataRequest: LandPlotRequest = {
      ...plotData,
      numberOfRows: rowsData.length,
      landRows: rowsData.map((row) => ({
        rowIndex: row.index,
        treeAmount: row.plantsPerRow,
        distance: row.plantSpacing,
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
      if (!newPolygon) {
        toast.error(MESSAGES.DRAW_PLOT);
        return;
      }
      if (isOverlapping) {
        toast.error(MESSAGES.OVERLAPPING_PLOT);
        return;
      }
      setPlotData((prev) => ({
        ...prev,
        landPlotName: form.getFieldValue(createPlotFormFields.landPlotName),
        area: form.getFieldValue(createPlotFormFields.area),
        plotLength: form.getFieldValue(createPlotFormFields.length),
        plotWidth: form.getFieldValue(createPlotFormFields.width),
        soilType: form.getFieldValue(createPlotFormFields.soilType),
        description: form.getFieldValue(createPlotFormFields.description),
        targetMarket: form.getFieldValue(createPlotFormFields.targetMarket),
        landPlotCoordinations: newPolygon.coordinates[0].map(([longitude, latitude]) => ({
          longitude,
          latitude,
        })),
      }));

      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === 1) {
      const values = await form.validateFields();
      // const values = form.getFieldsValue();
      const {
        [createPlotFormFields.rowLength]: rowLength,
        [createPlotFormFields.rowWidth]: rowWidth,
        [createPlotFormFields.numberOfRows]: numberOfRows,
        [createPlotFormFields.plantsPerRow]: plantsPerRow,
        [createPlotFormFields.plantSpacing]: plantSpacing,
        [createPlotFormFields.rowOrientation]: rowOrientation,
        [createPlotFormFields.lineSpacing]: lineSpacing,
        [createPlotFormFields.rowsPerLine]: rowsPerLine,
        [createPlotFormFields.rowSpacing]: rowSpacing,
      } = values;

      if (isPlantOverflowing(plantSpacing, plantsPerRow, rowLength)) {
        toast.error(MESSAGES.OUT_PLANT);
        return;
      }

      const generatedRows: rowStateType[] = Array.from({ length: numberOfRows }, (_, index) => ({
        id: index + 1,
        length: rowLength,
        width: rowWidth,
        plantsPerRow,
        plantSpacing,
        index: index + 1,
      }));

      setRowsData(generatedRows);
      const isHorizontal = rowOrientation === "Horizontal" ? true : false;
      setPlotData((prev) => ({
        ...prev,
        isHorizontal: isHorizontal,
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

  const resetForm = () => {
    form.resetFields();
    setCurrentStep(0);
    setNewPolygon(null);
    setPolygonDimensions(0, 0, 0);
  };

  const confirmClose = () => {
    if (isDirty || newPolygon) {
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
            <Steps
              current={currentStep}
              size="small"
              className={`${style.steps} ${styles.customSteps}`}
            >
              <Step title="Draw Plot" />
              <Step title="Set Up Rows" />
              <Step title="Confirm" />
            </Steps>
            <EditActions
              handleBtn1={currentStep === 0 ? confirmClose : handlePrev}
              handleBtn2={handleNext}
              labelBtn1={currentStep === 0 ? "Cancel" : "Previous"}
              labelBtn2={currentStep === 2 ? "Finish" : "Next"}
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
          <LandPlotCreate landPlots={landPlots} form={form} setIsDirty={setIsDirty} />
        )}
        {currentStep === 1 && <RowConfiguration form={form} setIsDirty={setIsDirty} />}
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
          form.resetFields();
          updateConfirmModal.hideModal();
          resetForm();
          setIsDirty(false);
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
