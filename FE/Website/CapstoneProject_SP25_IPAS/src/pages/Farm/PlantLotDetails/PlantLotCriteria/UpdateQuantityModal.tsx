import { Alert, Button, Flex, Form } from "antd";
import { useState, useEffect } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { RulesManager } from "@/utils";
import { CRITERIA_TARGETS, MESSAGES } from "@/constants";
import { usePlantLotStore } from "@/stores";
import { toast } from "react-toastify";

type UpdateQuantityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quantity: number, supplementQuantity?: number) => void;
  isAllConditionPassed?: boolean;
  target?: string;
  isLoadingAction?: boolean;
};

const UpdateQuantityModal = ({
  isOpen,
  onClose,
  onSave,
  isAllConditionPassed = true,
  target,
  isLoadingAction,
}: UpdateQuantityModalProps) => {
  const [form] = Form.useForm();
  const { lot } = usePlantLotStore();
  const [showSupplementInput, setShowSupplementInput] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [hasConfirmedNoSupplement, setHasConfirmedNoSupplement] = useState(false);

  const resetForm = () => {
    setShowSupplementInput(false);
    setWarningMessage("");
    setHasConfirmedNoSupplement(false);
    form.resetFields();
  };

  useEffect(() => {
    resetForm();
    if (isOpen) {
      form.setFieldsValue({
        inputQuantity:
          target === CRITERIA_TARGETS["Plantlot Condition"]
            ? !isAllConditionPassed
              ? 0
              : lot?.inputQuantity
            : undefined,
        lastQuantity:
          target === CRITERIA_TARGETS["Plantlot Evaluation"] ? lot?.lastQuantity : undefined,
      });
    }
  }, [isOpen]);

  const handleOk = async () => {
    await form.validateFields();
    if (!lot) return;

    const inputQuantity = form.getFieldValue("inputQuantity");
    const supplementQuantity = form.getFieldValue("supplementQuantity");
    const lastQuantity = form.getFieldValue("lastQuantity");

    if (target === CRITERIA_TARGETS["Plantlot Condition"]) {
      if (isAllConditionPassed && inputQuantity == 0) {
        toast.warning(`Quantity must be greater than 0 if condition is passed`);
        return;
      }
      const requiredSupplement = lot.previousQuantity - inputQuantity;

      if (
        inputQuantity < lot.previousQuantity &&
        isNaN(supplementQuantity) &&
        lot.additionalPlantLots.length === 0 &&
        !hasConfirmedNoSupplement &&
        !lot.isFromGrafted
      ) {
        setWarningMessage(
          `The current quantity is lower than expected by ${requiredSupplement}. Would you like to add a supplementary lot?`,
        );
        return;
      }

      if (supplementQuantity > requiredSupplement) {
        toast.warning(
          `Supplement quantity is insufficient. Please add at least ${requiredSupplement}.`,
        );
        return;
      }

      if (inputQuantity > lot.previousQuantity) {
        toast.warning(MESSAGES.LOT_CRITERIA_CONDITION);
        return;
      }

      // if (lot.inputQuantity && inputQuantity > lot.inputQuantity) {
      //   toast.warning(MESSAGES.LOT_CRITERIA_CONDITION_MAX);
      //   return;
      // }

      onSave(Number(inputQuantity), Number(supplementQuantity));
    }

    if (target === CRITERIA_TARGETS["Plantlot Evaluation"]) {
      if (lastQuantity > lot.inputQuantity) {
        toast.warning(MESSAGES.LOT_CRITERIA_EVALUATION);
        return;
      }

      // if (lot.lastQuantity && lastQuantity > lot.lastQuantity) {
      //   toast.warning(MESSAGES.LOT_CRITERIA_EVALUATION_MAX);
      //   return;
      // }

      onSave(Number(lastQuantity));
    }
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleOk}
      isLoading={isLoadingAction}
      title={`Enter Quantity for Completed ${target}`}
      saveLabel="Save"
    >
      <Form form={form} layout="vertical">
        {target === CRITERIA_TARGETS["Plantlot Evaluation"] ? (
          <FormFieldModal
            label="Qualified Quantity"
            name="lastQuantity"
            rules={RulesManager.getQuantityRules()}
          />
        ) : (
          <>
            <FormFieldModal
              label="Checked Quantity"
              name="inputQuantity"
              readonly={!isAllConditionPassed}
              rules={RulesManager.getQuantityRules()}
            />
            {warningMessage && (
              <Alert
                message={warningMessage}
                type="warning"
                showIcon
                action={
                  <Flex vertical gap={14} style={{ padding: "10px 0" }}>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        setShowSupplementInput(true);
                        setWarningMessage("");
                      }}
                    >
                      Yes, add more
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        setShowSupplementInput(false);
                        setWarningMessage("");
                        setHasConfirmedNoSupplement(true);
                      }}
                    >
                      No, continue
                    </Button>
                  </Flex>
                }
              />
            )}

            {showSupplementInput && (
              <FormFieldModal
                label="Supplement Quantity"
                name="supplementQuantity"
                rules={RulesManager.getQuantityRules()}
              />
            )}
          </>
        )}
      </Form>
    </ModalForm>
  );
};

export default UpdateQuantityModal;
