import { Flex, Form } from "antd";
import { useEffect, useState } from "react";
import { FormFieldModal, ModalForm } from "@/components";
import { usePlantLotOptions } from "@/hooks";
import { RulesManager } from "@/utils";
import { plantFormFields } from "@/constants";
import { SelectOption } from "@/types";
import { landPlotService, landRowService } from "@/services";

type ConvertToPlantModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rowId: number, plantIndex: number) => void;
  isLoadingAction?: boolean;
};

const ConvertToPlantModal = ({ isOpen, onClose, onSave, isLoadingAction }: ConvertToPlantModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState({
    plots: false,
    rows: false,
    indexes: false,
  });
  const [plots, setPlots] = useState<SelectOption[]>([]);
  const [rows, setRows] = useState<SelectOption[]>([]);
  const [plantIndexes, setPlantIndexes] = useState<SelectOption[]>([]);

  const resetForm = () => {
    setRows([]);
    setPlantIndexes([]);
    form.resetFields();
  };

  useEffect(() => {
    if (!isOpen) return;
    resetForm();
    fetchPlotData();
  }, [isOpen]);

  const fetchPlotData = async () => {
    setLoading((prev) => ({ ...prev, plots: true }));
    try {
      const res = await landPlotService.getLandPlotsSelected();

      // Xử lý danh sách thửa đất
      if (res.statusCode === 200 && Array.isArray(res.data)) {
        setPlots(res.data.map(({ id, code, name }) => ({ value: id, label: `${name} - ${code}` })));
      }
    } finally {
      setLoading({ plots: false, rows: false, indexes: false });
    }
  };

  const handlePlotChange = async (plotId: number) => {
    form.setFieldsValue({
      [plantFormFields.landPlotId]: plotId,
      [plantFormFields.landRowId]: undefined,
      [plantFormFields.plantIndex]: undefined,
    });
    if (!plotId) return setRows([]), setPlantIndexes([]);

    setLoading((prev) => ({ ...prev, rows: true }));
    try {
      const res = await landRowService.getLandRowsSelected(plotId);
      if (res.statusCode === 200) {
        setRows(res.data.map(({ id, code, name }) => ({ value: id, label: `${name} - ${code}` })));
      }
    } finally {
      setLoading((prev) => ({ ...prev, rows: false }));
    }
  };

  const handleRowChange = async (rowId: number) => {
    form.setFieldsValue({
      [plantFormFields.landRowId]: rowId,
      [plantFormFields.plantIndex]: undefined,
    });
    if (!rowId) return setPlantIndexes([]);

    setLoading((prev) => ({ ...prev, indexes: true }));
    try {
      const res = await landRowService.getPlantIndexesByRowId(rowId);

      if (res.statusCode === 200) {
        if (res.data)
          setPlantIndexes(res.data.map((index) => ({ value: index, label: `Plant #${index}` })));
      }
    } finally {
      setLoading((prev) => ({ ...prev, indexes: false }));
    }
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    onSave(values[plantFormFields.landRowId], values[plantFormFields.plantIndex]);
  };

  const handleCancel = () => onClose();

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={handleCancel}
      onSave={handleOk}
      isLoading={isLoadingAction}
      title={"Convert to Plant"}
      saveLabel="Convert"
      size="normalXL"
    >
      <Form form={form} layout="vertical">
        <Flex justify="space-between" vertical>
          <FormFieldModal
            type="select"
            label="Plot"
            name={plantFormFields.landPlotId}
            options={plots}
            isLoading={loading.plots}
            onChange={handlePlotChange}
            rules={RulesManager.getSelectPlotRules()}
          />
          <Flex gap={20}>
            <FormFieldModal
              type="select"
              label="Row"
              name={plantFormFields.landRowId}
              options={rows}
              isLoading={loading.rows}
              onChange={handleRowChange}
              rules={RulesManager.getSelectRowRules()}
            />
            <FormFieldModal
              type="select"
              label="Plant Index"
              name={plantFormFields.plantIndex}
              options={plantIndexes}
              isLoading={loading.indexes}
              rules={RulesManager.getSelectPlantIndexRules()}
            />
          </Flex>
        </Flex>
      </Form>
    </ModalForm>
  );
};

export default ConvertToPlantModal;
