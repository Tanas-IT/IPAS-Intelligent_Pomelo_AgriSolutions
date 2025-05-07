import { Form } from "antd";
import { useEffect, useState } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { usePlantLotOptions } from "@/hooks";
import { formatDate, getUserId, RulesManager } from "@/utils";
import { AvailableHarvest, CreateHarvestRecordRequest } from "@/payloads";
import { plantService } from "@/services";
import { usePlantStore } from "@/stores";

type NewRecordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: CreateHarvestRecordRequest) => void;
  isLoadingAction?: boolean;
};

const NewRecordModal = ({ isOpen, onClose, onSave, isLoadingAction }: NewRecordModalProps) => {
  const { plantId } = usePlantStore();
  const resetForm = () => form.resetFields();
  const [form] = Form.useForm();
  const [availableHarvests, setAvailableHarvests] = useState<AvailableHarvest[]>([]);
  const [productOptions, setProductOptions] = useState<{ value: number; label: string }[]>([]);
  const [selectedHarvestId, setSelectedHarvestId] = useState<number | null>(null);
  if (!plantId) return;
  
  
  useEffect(() => {
    const fetchHarvests = async () => {
      const response = await plantService.getAvailableHarvestsForPlant(plantId);
      setAvailableHarvests(response.data);
    };

    if (!isOpen) return;

    fetchHarvests();
    resetForm();
  }, [isOpen]);

  useEffect(() => {
    if (selectedHarvestId) {
      const selectedHarvest = availableHarvests.find(
        (h) => h.harvestHistoryId === selectedHarvestId,
      );
      if (selectedHarvest) {
        const products = selectedHarvest.productHarvestHistory.map((p) => ({
          value: p.masterTypeId,
          label: p.productName,
        }));
        setProductOptions(products);
        form.setFieldsValue({ masterTypeId: undefined });
      } else {
        setProductOptions([]);
      }
    } else {
      setProductOptions([]);
    }
  }, [selectedHarvestId, availableHarvests]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const req: CreateHarvestRecordRequest = {
      harvestHistoryId: values.harvestId,
      masterTypeId: values.masterTypeId,
      userId: Number(getUserId()),
      plantHarvestRecords: [
        {
          plantId: plantId,
          quantity: values.quantity,
        },
      ],
    };
    onSave(req);
  };

  const handleCancel = () => onClose();

  const harvestOptions = availableHarvests.map((h) => ({
    value: h.harvestHistoryId,
    label: `${h.cropName} - ${formatDate(h.dateHarvest)} - ${h.harvestHistoryCode}`,
  }));

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={handleCancel}
      onSave={handleOk}
      isLoading={isLoadingAction}
      title={"Add Yield Record"}
    >
      <Form form={form} layout="vertical">
        <FormFieldModal
          type="select"
          label="Harvest Day"
          name={"harvestId"}
          rules={RulesManager.getRequiredRules("Harvest Day")}
          options={harvestOptions}
          onChange={(value) => setSelectedHarvestId(value)}
        />
        <FormFieldModal
          type="select"
          label="Product Type"
          name={"masterTypeId"}
          rules={RulesManager.getRequiredRules("Product Type")}
          options={productOptions}
        />
        <FormFieldModal
          type="text"
          label="Yield"
          name={"quantity"}
          rules={RulesManager.getNumberRulesAllowZero("Yield")}
          options={productOptions}
        />
      </Form>
    </ModalForm>
  );
};

export default NewRecordModal;
