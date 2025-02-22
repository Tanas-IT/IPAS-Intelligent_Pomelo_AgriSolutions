import { Drawer, Steps, Flex, Modal, Form } from "antd";
import { useEffect, useState } from "react";
import { GetLandPlot } from "@/payloads";
import { ConfirmModal, EditActions } from "@/components";
import { LandPlotCreate } from "@/pages";
import style from "./AddNewPlotDrawer.module.scss";
import { useFormManager, useModal, useStyle } from "@/hooks";

const { Step } = Steps;

interface AddNewPlotDrawerProps {
  landPlots: GetLandPlot[];
  isOpen: boolean;
  onClose: () => void;
}

const AddNewPlotDrawer: React.FC<AddNewPlotDrawerProps> = ({ landPlots, isOpen, onClose }) => {
  const { styles } = useStyle();
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [isDirty, setIsDirty] = useState(false);
  const updateConfirmModal = useModal();
  const [plotData, setPlotData] = useState({}); // Lưu dữ liệu từ bước 1

  const handleSave = () => {
    console.log("Saved values:", plotData);
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      const values = await form.validateFields();
      setPlotData(values);
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSave();
    }
  };

  const handlePrev = () => setCurrentStep((prev) => prev - 1);

  const confirmClose = () => {
    if (isDirty) {
      updateConfirmModal.showModal();
    } else {
      setCurrentStep(0);
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
              <Step title="Add Rows" />
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
        {currentStep === 1 && <div>Step 2: Add Rows (Coming Soon)</div>}
        {currentStep === 2 && <div>Step 3: Confirm Details</div>}
      </Drawer>
      <ConfirmModal
        visible={updateConfirmModal.modalState.visible}
        actionType="unsaved"
        onConfirm={() => {
          form.resetFields();
          updateConfirmModal.hideModal();
          setIsDirty(false);
          setCurrentStep(0);
          onClose();
        }}
        onCancel={updateConfirmModal.hideModal}
      />
      ;
    </>
  );
};

export default AddNewPlotDrawer;
