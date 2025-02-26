import { Drawer, Steps, Flex, Form } from "antd";
import { useEffect, useState } from "react";
import { GetLandPlot } from "@/payloads";
import { ConfirmModal, EditActions } from "@/components";
import { DraggableRow, LandPlotCreate, RowConfiguration } from "@/pages";
import style from "./AddNewPlotDrawer.module.scss";
import { useModal, useStyle } from "@/hooks";
import { rowStateType } from "@/types";
import { useMapStore } from "@/stores";
import { toast } from "react-toastify";
import { fakeRowsData } from "../DraggableRow/fakeRowsData";
import { createPlotFormFields } from "@/constants";

const { Step } = Steps;

interface AddNewPlotDrawerProps {
  landPlots: GetLandPlot[];
  isOpen: boolean;
  onClose: () => void;
}

const AddNewPlotDrawer: React.FC<AddNewPlotDrawerProps> = ({ landPlots, isOpen, onClose }) => {
  const { styles } = useStyle();
  const [currentStep, setCurrentStep] = useState(1);
  const [form] = Form.useForm();
  const [isDirty, setIsDirty] = useState(false);
  const updateConfirmModal = useModal();
  const [plotData, setPlotData] = useState({}); // Lưu dữ liệu từ bước 1
  const [rowsData, setRowsData] = useState<rowStateType[]>(fakeRowsData);
  const { clearPolygons, isOverlapping, newPolygon, setNewPolygon, setPolygonDimensions } =
    useMapStore();
  const isHorizontal =
    form.getFieldValue(createPlotFormFields.rowOrientation) === "Horizontal" ? true : false;

  const handleSave = () => {
    console.log("Saved rows:", rowsData);

    // console.log("Saved values:", plotData);
    // console.log("Saved newPolygon:", newPolygon);
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      const values = await form.validateFields();
      if (!newPolygon) {
        toast.error("Please draw a plot before proceeding to the next step!");
        return;
      }
      if (isOverlapping) {
        toast.error("The new plot overlaps with an existing plot!");
        return;
      }
      setPlotData(values);
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === 1) {
      const values = await form.validateFields();
      // const values = form.getFieldsValue();
      const { rowLength, rowWidth, numberOfRows, plantsPerRow, plantSpacing } = values;

      const outPlant = (Number(plantSpacing) + 24) * Number(plantsPerRow);
      if (outPlant > rowLength) {
        toast.error(
          `The total number of plants exceeds the row's capacity. Please reduce the number of plants or adjust the spacing.`,
        );
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
        {currentStep === 1 && <RowConfiguration form={form} />}
        {currentStep === 2 && (
          <DraggableRow
            rowsData={rowsData}
            setRowsData={setRowsData}
            form={form}
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
